import { openaiService } from './openai';

export interface AnswerEvaluation {
  isCorrect: boolean;
  partialCredit?: number; // 0-1 scale for partial correctness
  feedback?: string;
  explanation?: string;
}

/**
 * AI-powered answer evaluation service that uses OpenAI to intelligently
 * evaluate student answers against correct answers, accounting for:
 * - Synonyms and alternative phrasings
 * - Partial correctness
 * - Minor spelling/grammar errors
 * - Different valid interpretations
 */
class AIAnswerEvaluationService {
  /**
   * Evaluate a student's answer against the correct answer using AI
   * @param userAnswer - The student's submitted answer
   * @param correctAnswer - The expected correct answer
   * @param question - The original question for context
   * @param difficulty - Question difficulty level for evaluation strictness
   * @returns Promise<AnswerEvaluation> - Evaluation result with correctness and feedback
   */
  async evaluateAnswer(
    userAnswer: string,
    correctAnswer: string,
    question: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<AnswerEvaluation> {
    try {
      // Fallback to simple comparison if AI fails
      const fallbackEvaluation = this.simpleFallbackEvaluation(userAnswer, correctAnswer);

      // Check if OpenAI API key is available
      const apiKey = await openaiService.getApiKey();
      if (!apiKey) {
        console.warn('OpenAI API key not found, using fallback evaluation');
        return fallbackEvaluation;
      }

      // Build the system prompt based on difficulty level
      const systemPrompt = this.buildSystemPrompt(difficulty);
      
      // Build the user prompt with question context
      const userPrompt = this.buildUserPrompt(question, correctAnswer, userAnswer);

      // Get AI evaluation
      const aiResponse = await openaiService.createCompletion(systemPrompt, userPrompt, {
        temperature: 0.1, // Low temperature for consistent evaluation
        max_tokens: 200
      });

      // Parse the AI response
      const evaluation = this.parseAIResponse(aiResponse);
      
      // Validate the evaluation and apply fallback if needed
      return this.validateEvaluation(evaluation, fallbackEvaluation);

    } catch (error) {
      console.error('AI answer evaluation failed, using fallback:', error);
      return this.simpleFallbackEvaluation(userAnswer, correctAnswer);
    }
  }

  /**
   * Build system prompt based on difficulty level
   */
  private buildSystemPrompt(difficulty: 'easy' | 'medium' | 'hard'): string {
    const basePrompt = `You are an intelligent answer evaluation system for educational flashcards. Your job is to evaluate whether a student's answer is correct compared to the expected answer.

You should be understanding of:
- Synonyms and alternative correct phrasings
- Minor spelling or grammar errors
- Different valid interpretations of the same concept
- Abbreviated forms and common variations

You should mark answers as incorrect only when:
- The meaning is fundamentally different
- Key facts or concepts are wrong
- The answer is completely unrelated`;

    const difficultyInstructions = {
      easy: 'Be LENIENT in your evaluation. Accept answers that show basic understanding even if not perfectly phrased.',
      medium: 'Be BALANCED in your evaluation. Accept reasonable variations but ensure core concepts are correct.',
      hard: 'Be STRICT but FAIR in your evaluation. Require precise understanding but allow for valid alternative expressions.'
    };

    return `${basePrompt}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyInstructions[difficulty]}

Respond with a JSON object containing:
{
  "isCorrect": boolean,
  "partialCredit": number (0.0 to 1.0, where 1.0 is fully correct),
  "feedback": "Brief explanation of why it's correct/incorrect",
  "explanation": "Optional: Additional context or what was expected"
}`;
  }

  /**
   * Build user prompt with question context
   */
  private buildUserPrompt(question: string, correctAnswer: string, userAnswer: string): string {
    return `QUESTION: ${question}

EXPECTED ANSWER: ${correctAnswer}

STUDENT'S ANSWER: ${userAnswer}

Please evaluate the student's answer and respond with the JSON evaluation.`;
  }

  /**
   * Parse AI response and extract evaluation
   */
  private parseAIResponse(response: string): AnswerEvaluation {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        isCorrect: Boolean(parsed.isCorrect),
        partialCredit: typeof parsed.partialCredit === 'number' ? 
          Math.max(0, Math.min(1, parsed.partialCredit)) : undefined,
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : undefined,
        explanation: typeof parsed.explanation === 'string' ? parsed.explanation : undefined
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Validate AI evaluation and apply fallback if needed
   */
  private validateEvaluation(
    aiEvaluation: AnswerEvaluation, 
    fallbackEvaluation: AnswerEvaluation
  ): AnswerEvaluation {
    // Basic validation - if AI evaluation seems invalid, use fallback
    if (typeof aiEvaluation.isCorrect !== 'boolean') {
      console.warn('Invalid AI evaluation, using fallback');
      return fallbackEvaluation;
    }

    // Ensure partial credit is reasonable
    if (aiEvaluation.partialCredit !== undefined) {
      if (aiEvaluation.partialCredit < 0 || aiEvaluation.partialCredit > 1) {
        aiEvaluation.partialCredit = aiEvaluation.isCorrect ? 1 : 0;
      }
    } else {
      // Set default partial credit
      aiEvaluation.partialCredit = aiEvaluation.isCorrect ? 1 : 0;
    }

    return aiEvaluation;
  }

  /**
   * Simple fallback evaluation using string comparison
   */
  private simpleFallbackEvaluation(userAnswer: string, correctAnswer: string): AnswerEvaluation {
    const userNormalized = userAnswer.trim().toLowerCase();
    const correctNormalized = correctAnswer.trim().toLowerCase();
    
    const isExactMatch = userNormalized === correctNormalized;
    const isPartialMatch = userNormalized.includes(correctNormalized) || 
                          correctNormalized.includes(userNormalized);

    return {
      isCorrect: isExactMatch,
      partialCredit: isExactMatch ? 1 : (isPartialMatch ? 0.5 : 0),
      feedback: isExactMatch ? 
        'Correct!' : 
        isPartialMatch ? 
          'Partially correct - check your answer' : 
          'Incorrect - try again',
      explanation: !isExactMatch ? `Expected: ${correctAnswer}` : undefined
    };
  }

  /**
   * Batch evaluate multiple answers (useful for exam mode)
   */
  async evaluateAnswers(
    answers: Array<{
      userAnswer: string;
      correctAnswer: string;
      question: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }>
  ): Promise<AnswerEvaluation[]> {
    const evaluations = await Promise.allSettled(
      answers.map(({ userAnswer, correctAnswer, question, difficulty }) =>
        this.evaluateAnswer(userAnswer, correctAnswer, question, difficulty)
      )
    );

    return evaluations.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Evaluation failed for answer ${index}:`, result.reason);
        return this.simpleFallbackEvaluation(
          answers[index].userAnswer, 
          answers[index].correctAnswer
        );
      }
    });
  }
}

// Export singleton instance
export const aiAnswerEvaluationService = new AIAnswerEvaluationService();
