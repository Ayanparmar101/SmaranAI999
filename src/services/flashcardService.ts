import { completionService } from '@/services/openai/completionService';
import { PDFService } from '@/services/pdfService';
import { Flashcard, FlashcardSet } from '@/types/flashcard';
import { requestCache } from '@/utils/requestCache';
import { optimizedFirebaseService } from './optimizedFirebaseService';
import { v4 as uuidv4 } from 'uuid';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export class FlashcardService {
  
  /**
   * Generate flashcards from PDF file
   */
  async generateFlashcardsFromPDF(file: File, options?: {
    numberOfCards?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;
  }): Promise<Flashcard[]> {
    try {
      console.log('[FlashcardService] Starting flashcard generation from PDF:', file.name);
      
      // Extract text from PDF
      const pdfText = await PDFService.extractTextFromPDF(file);
      
      if (!pdfText || pdfText.trim().length < 100) {
        throw new Error('Insufficient text content in PDF for flashcard generation');
      }

      // Generate flashcards using AI
      const flashcards = await this.generateFlashcardsFromText(
        pdfText,
        file.name,
        options
      );

      console.log('[FlashcardService] Generated', flashcards.length, 'flashcards from PDF');
      return flashcards;

    } catch (error) {
      console.error('[FlashcardService] Error generating flashcards from PDF:', error);
      throw error;
    }
  }

  /**
   * Generate flashcards from text content using AI
   */
  async generateFlashcardsFromText(
    text: string, 
    source: string,
    options?: {
      numberOfCards?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      category?: string;
    }
  ): Promise<Flashcard[]> {
    try {
      const numberOfCards = options?.numberOfCards || 10;
      const difficulty = options?.difficulty || 'medium';
      const category = options?.category || 'General';

      const systemPrompt = `You are an expert educational content creator specializing in generating high-quality flashcards for students. Your task is to create comprehensive, well-structured flashcards from the provided text content.

Guidelines for flashcard creation:
1. Create exactly ${numberOfCards} flashcards
2. Focus on key concepts, definitions, facts, and important details
3. Make questions clear, specific, and at ${difficulty} difficulty level
4. Ensure answers are concise but complete
5. Cover different types of learning: factual recall, conceptual understanding, and application
6. Avoid questions that are too obvious or too obscure
7. Use varied question formats (what, how, why, when, who, etc.)

Difficulty levels:
- Easy: Basic facts and definitions
- Medium: Conceptual understanding and connections
- Hard: Analysis, synthesis, and application

Return the flashcards in the following JSON format:
{
  "flashcards": [
    {
      "question": "Clear, specific question",
      "answer": "Concise but complete answer",
      "difficulty": "${difficulty}",
      "category": "${category}"
    }
  ]
}

Ensure the JSON is valid and properly formatted.`;

      const userPrompt = `Generate ${numberOfCards} flashcards from the following text content:

${text.substring(0, 8000)}`; // Limit text to avoid token limits

      console.log('[FlashcardService] Requesting AI to generate flashcards...');
      
      const response = await completionService.createCompletion(
        systemPrompt,
        userPrompt,
        {
          max_tokens: 2000,
          temperature: 0.7
        }
      );

      // Parse the AI response
      const parsedResponse = this.parseFlashcardResponse(response);
      
      // Convert to our Flashcard type
      const flashcards: Flashcard[] = parsedResponse.flashcards.map(card => ({
        id: uuidv4(),
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty as 'easy' | 'medium' | 'hard',
        category: card.category,
        createdAt: new Date(),
        source: source,
        reviewCount: 0,
        correctCount: 0
      }));

      return flashcards;

    } catch (error) {
      console.error('[FlashcardService] Error generating flashcards from text:', error);
      throw error;
    }
  }

  /**
   * Parse AI response and extract flashcards
   */
  private parseFlashcardResponse(response: string): { flashcards: any[] } {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Invalid flashcard format in AI response');
      }

      return parsed;

    } catch (error) {
      console.error('[FlashcardService] Error parsing AI response:', error);
      
      // Fallback: try to extract questions and answers from plain text
      return this.extractFlashcardsFromPlainText(response);
    }
  }

  /**
   * Fallback method to extract flashcards from plain text response
   */
  private extractFlashcardsFromPlainText(text: string): { flashcards: any[] } {
    const flashcards: any[] = [];
    
    // Simple pattern matching for Q&A format
    const qaPattern = /(?:Question|Q)[\s\d]*:?\s*(.+?)(?:\n|\r\n)(?:Answer|A)[\s\d]*:?\s*(.+?)(?=(?:\n|\r\n)(?:Question|Q)|$)/gi;
    
    let match;
    while ((match = qaPattern.exec(text)) !== null && flashcards.length < 10) {
      flashcards.push({
        question: match[1].trim(),
        answer: match[2].trim(),
        difficulty: 'medium',
        category: 'General'
      });
    }

    return { flashcards };
  }  /**
   * Save flashcard set to Firebase Firestore
   */
  async saveFlashcardSet(
    flashcards: Flashcard[],
    title: string,
    userId: string,
    sourceFile?: string,
    description?: string
  ): Promise<FlashcardSet> {
    try {
      console.log('[FlashcardService] Starting save to Firebase:', {
        title,
        userId,
        flashcardsCount: flashcards.length,
        sourceFile,
        description
      });

      // Check if Firebase/Firestore is available
      if (!db) {
        throw new Error('Firestore database not initialized');
      }

      const flashcardSet: Omit<FlashcardSet, 'id'> = {
        title,
        description: description || '',
        flashcards,
        userId,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceFile,
        totalCards: flashcards.length
      };

      console.log('[FlashcardService] Prepared flashcard set for save:', flashcardSet);

      // Prepare the data for Firestore
      const firestoreData = {
        ...flashcardSet,
        createdAt: Timestamp.fromDate(flashcardSet.createdAt),
        updatedAt: Timestamp.fromDate(flashcardSet.updatedAt),
        flashcards: flashcards.map(card => ({
          ...card,
          createdAt: Timestamp.fromDate(card.createdAt),
          lastReviewed: card.lastReviewed ? Timestamp.fromDate(card.lastReviewed) : null
        }))
      };

      console.log('[FlashcardService] Attempting to save to Firestore collection "flashcardSets"...');
      const docRef = await addDoc(collection(db, 'flashcardSets'), firestoreData);

      const savedSet: FlashcardSet = {
        ...flashcardSet,
        id: docRef.id
      };

      // Invalidate cache after saving
      requestCache.invalidatePattern(`flashcard-sets-${userId}`);

      console.log('[FlashcardService] Successfully saved flashcard set with ID:', docRef.id);
      console.log('[FlashcardService] Saved set structure:', savedSet);
      return savedSet;

    } catch (error) {
      console.error('[FlashcardService] Error saving flashcard set to Firebase:', error);
      console.error('[FlashcardService] Error details:', {
        message: (error as Error).message,
        code: (error as any).code,
        stack: (error as Error).stack
      });

      // Fallback to localStorage
      console.log('[FlashcardService] Falling back to localStorage');
      const flashcardSet: FlashcardSet = {
        id: uuidv4(),
        title,
        description: description || '',
        flashcards,
        userId,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceFile,
        totalCards: flashcards.length
      };

      const existingSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
      existingSets.push(flashcardSet);
      localStorage.setItem('flashcardSets', JSON.stringify(existingSets));

      // Invalidate cache after saving to localStorage too
      requestCache.invalidatePattern(`flashcard-sets-${userId}`);

      return flashcardSet;
    }
  }  /**
   * Load flashcard sets for a user with optimized Firebase operations and caching
   */
  async loadFlashcardSets(userId: string): Promise<FlashcardSet[]> {
    try {
      console.log('[FlashcardService] Loading flashcard sets for user:', userId);

      // Use optimized Firebase service with intelligent caching
      const result = await optimizedFirebaseService.queryCollection<any>(
        'flashcardSets',
        {
          where: [['userId', '==', userId]],
          orderBy: [['createdAt', 'desc']],
          cache: true,
          cacheTTL: 5 * 60 * 1000, // 5 minutes cache for flashcard progress
          batch: false // High priority for user data
        }
      );

      const flashcardSets: FlashcardSet[] = result.docs.map((data) => ({
        id: data.id,
        title: data.title,
        description: data.description || '',
        flashcards: data.flashcards.map((card: any) => ({
          ...card,
          createdAt: card.createdAt.toDate(),
          lastReviewed: card.lastReviewed ? card.lastReviewed.toDate() : undefined
        })),
        userId: data.userId,
        isPublic: data.isPublic || false,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        sourceFile: data.sourceFile,
        totalCards: data.totalCards
      }));

      console.log('[FlashcardService] Successfully loaded', flashcardSets.length, 'flashcard sets');
      return flashcardSets;

    } catch (error) {
      console.error('[FlashcardService] Error loading flashcard sets:', error);

      // Fallback to localStorage
      console.log('[FlashcardService] Falling back to localStorage');
      const existingSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
      const userSets = existingSets.filter((set: FlashcardSet) => set.userId === userId);
      console.log('[FlashcardService] Loaded', userSets.length, 'sets from localStorage');
      return userSets;
    }
  }

  /**
   * Update an existing flashcard set using optimized Firebase operations
   */
  async updateFlashcardSet(
    setId: string,
    updates: Partial<Omit<FlashcardSet, 'id' | 'createdAt' | 'userId'>>
  ): Promise<void> {
    try {
      console.log('[FlashcardService] Updating flashcard set:', setId);

      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Convert flashcards dates to Timestamps if flashcards are being updated
      if (updates.flashcards) {
        updateData.flashcards = updates.flashcards.map(card => ({
          ...card,
          createdAt: Timestamp.fromDate(card.createdAt),
          lastReviewed: card.lastReviewed ? Timestamp.fromDate(card.lastReviewed) : null
        }));
        updateData.totalCards = updates.flashcards.length;
      }

      // Use optimized Firebase service for batched operations
      await optimizedFirebaseService.batchWrite([
        {
          type: 'update',
          collection: 'flashcardSets',
          docId: setId,
          data: updateData,
          priority: 'normal'
        }
      ]);

      console.log('[FlashcardService] Successfully updated flashcard set');

      // Invalidate relevant caches
      requestCache.invalidatePattern(`flashcard-sets-*`);
      requestCache.invalidate(`doc:flashcardSets:${setId}`);

    } catch (error) {
      console.error('[FlashcardService] Error updating flashcard set:', error);
      throw error;
    }
  }

  /**
   * Delete a flashcard set from Firebase Firestore
   */
  async deleteFlashcardSet(setId: string): Promise<void> {
    try {
      console.log('[FlashcardService] Deleting flashcard set:', setId);
      
      await deleteDoc(doc(db, 'flashcardSets', setId));
      console.log('[FlashcardService] Successfully deleted flashcard set');

    } catch (error) {
      console.error('[FlashcardService] Error deleting flashcard set:', error);
      throw error;
    }
  }
  /**
   * Get a specific flashcard set by ID
   */
  async getFlashcardSet(setId: string): Promise<FlashcardSet | null> {
    try {
      console.log('[FlashcardService] Getting flashcard set:', setId);
      
      const docRef = doc(db, 'flashcardSets', setId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return null;
      }

      const docData = docSnapshot.data();
      const flashcardSet: FlashcardSet = {
        id: docSnapshot.id,
        title: docData.title,
        description: docData.description || '',
        flashcards: docData.flashcards.map((card: any) => ({
          ...card,
          createdAt: card.createdAt.toDate(),
          lastReviewed: card.lastReviewed ? card.lastReviewed.toDate() : undefined
        })),
        userId: docData.userId,
        isPublic: docData.isPublic || false,
        createdAt: docData.createdAt.toDate(),
        updatedAt: docData.updatedAt.toDate(),
        sourceFile: docData.sourceFile,
        totalCards: docData.totalCards
      };

      return flashcardSet;

    } catch (error) {
      console.error('[FlashcardService] Error getting flashcard set:', error);
      return null;
    }
  }
}

export const flashcardService = new FlashcardService();
