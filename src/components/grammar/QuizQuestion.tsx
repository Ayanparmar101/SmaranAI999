
import React from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';

interface QuizQuestionProps {
  question: {
    question: string;
    options: string[];
    correctIndex: number;
    explanations?: string[];
  };
  questionIndex: number;
  userAnswer: number;
  showResults: boolean;
  onAnswerSelect: (answerIndex: number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  userAnswer,
  showResults,
  onAnswerSelect
}) => {
  return (
    <div className="bg-muted/50 p-4 rounded-xl border-3 border-black shadow-neo-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="font-medium flex-1 text-center sm:text-left">{questionIndex + 1}. {question.question}</p>
      </div>
      <div className="space-y-2">
        {question.options.map((option, oIndex) => (
          <div
            key={oIndex}
            onClick={() => onAnswerSelect(oIndex)}
            className={`p-3 rounded-lg cursor-pointer flex items-center transition-all border-3 min-h-[48px] ${
              userAnswer === oIndex
                ? 'border-black bg-kid-green/20 shadow-none translate-y-1'
                : 'border-black bg-white shadow-neo-sm hover:shadow-none hover:translate-y-1'
            } ${
              showResults
                ? oIndex === question.correctIndex
                  ? 'bg-green-100 border-black text-green-900 shadow-none translate-y-1'
                  : userAnswer === oIndex && userAnswer !== question.correctIndex
                    ? 'bg-red-100 border-black text-red-900 shadow-none translate-y-1'
                    : ''
                : ''
            }`}
          >
            <span className="mr-3 w-6 h-6 rounded-full bg-muted/80 flex items-center justify-center border-2 border-black">
              {String.fromCharCode(65 + oIndex)}
            </span>
            <span>{option}</span>
            {showResults && oIndex === question.correctIndex && (
              <CheckCircle className="ml-auto text-green-500 w-5 h-5" />
            )}
            {showResults && userAnswer === oIndex && userAnswer !== question.correctIndex && (
              <HelpCircle className="ml-auto text-red-500 w-5 h-5" />
            )}
          </div>
        ))}
      </div>
      {showResults && (
        <div className="mt-2 p-3 border-3 border-black rounded-lg bg-white shadow-neo-sm">
          {userAnswer === question.correctIndex ? (
            <div className="flex items-center justify-between">
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle size={16} /> Correct!
              </span>
            </div>
          ) : (
            <div className="text-red-600">
              <div className="flex items-start justify-between mb-2">
                <p className="flex-1">Incorrect. The correct answer is: {question.options[question.correctIndex]}</p>
              </div>
              {question.explanations && question.explanations[userAnswer] && (
                <div className="flex items-start justify-between">
                  <p className="text-sm flex-1">
                    Why it's wrong: {question.explanations[userAnswer]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
