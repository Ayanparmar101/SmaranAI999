import React, { useState, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Zap, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { flashcardService } from '@/services/flashcardService';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard } from '@/types/flashcard';

interface PDFUploadProps {
  onFlashcardsGenerated: (flashcards: Flashcard[], fileName: string) => void;
}

const PDFUpload: React.FC<PDFUploadProps> = memo(({ onFlashcardsGenerated }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numberOfCards, setNumberOfCards] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [category, setCategory] = useState('');

  // Memoize file selection handler to prevent re-renders
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  }, []);

  // Memoize generation handler to prevent re-renders
  const handleGenerateFlashcards = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    if (!user) {
      toast.error('Please sign in to generate flashcards');
      return;
    }

    setIsGenerating(true);

    try {
      toast.info('Extracting text from PDF...');

      const flashcards = await flashcardService.generateFlashcardsFromPDF(selectedFile, {
        numberOfCards: parseInt(numberOfCards),
        difficulty,
        category: category || undefined
      });

      if (flashcards.length === 0) {
        toast.error('No flashcards could be generated from this PDF');
        return;
      }

      toast.success(`Generated ${flashcards.length} flashcards successfully!`);
      onFlashcardsGenerated(flashcards, selectedFile.name);

    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      toast.error(error.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedFile, user, numberOfCards, difficulty, category, onFlashcardsGenerated]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upload PDF & Generate Flashcards</h2>
          <p className="text-muted-foreground">
            Upload a PDF document and let AI create study flashcards for you
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="pdf-upload">Select PDF File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-32">{selectedFile.name}</span>
                <span>({(selectedFile.size / (1024 * 1024)).toFixed(1)}MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-cards">Number of Cards</Label>
            <Select value={numberOfCards} onValueChange={setNumberOfCards}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 cards</SelectItem>
                <SelectItem value="10">10 cards</SelectItem>
                <SelectItem value="15">15 cards</SelectItem>
                <SelectItem value="20">20 cards</SelectItem>
                <SelectItem value="25">25 cards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="e.g., Science, History"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateFlashcards}
          disabled={!selectedFile || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Settings className="w-5 h-5 mr-2 animate-spin" />
              Generating Flashcards...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Generate Flashcards
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Tips for better flashcards:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Use PDFs with clear, readable text</li>
            <li>Educational content works best (textbooks, notes, articles)</li>
            <li>Choose appropriate difficulty based on your learning level</li>
            <li>Add a category to help organize your flashcard sets</li>
          </ul>
        </div>
      </div>
    </Card>
  );
});

export default PDFUpload;
