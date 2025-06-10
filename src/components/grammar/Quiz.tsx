
import React from 'react';
import { NeoButton } from '@/components/NeoButton';
import { RefreshCw } from 'lucide-react';
import QuizQuestion from './QuizQuestion';

interface QuizProps {
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanations?: string[];
  }[];
  userAnswers: number[];
  showResults: boolean;
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  onSubmitQuiz: () => void;
  onResetQuiz: () => void;
  onNewPractice: () => void;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  userAnswers,
  showResults,
  onAnswerSelect,
  onSubmitQuiz,
  onResetQuiz,
  onNewPractice
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg sm:text-xl font-semibold text-center sm:text-left">Practice Quiz:</h3>
        </div>
        {showResults && (
          <NeoButton
            variant="success"
            size="sm"
            onClick={onResetQuiz}
            icon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Try Again
          </NeoButton>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <QuizQuestion
            key={qIndex}
            question={question}
            questionIndex={qIndex}
            userAnswer={userAnswers[qIndex]}
            showResults={showResults}
            onAnswerSelect={(answerIndex) => onAnswerSelect(qIndex, answerIndex)}
          />
        ))}
      </div>

      {!showResults ? (
        <div className="mt-8 flex justify-center gap-4">
          <NeoButton
            variant="success"
            size="lg"
            onClick={onSubmitQuiz}
            className="w-full sm:w-auto max-w-xs"
          >
            Submit Answers
          </NeoButton>
        </div>
      ) : (
        <div className="mt-8 flex justify-center gap-4">
          <NeoButton
            variant="secondary"
            size="lg"
            onClick={onNewPractice}
            className="w-full sm:w-auto max-w-xs"
          >
            New Practice
          </NeoButton>
        </div>
      )}
    </div>
  );
};

export default Quiz;
