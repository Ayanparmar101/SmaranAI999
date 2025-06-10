
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MathQuestionForm from '@/components/MathQuestionForm';
import { SquareDot } from 'lucide-react';
import { saveMessage } from '@/utils/messageUtils';
import { useAuth } from '@/contexts/AuthContext';
import NeoBackButton from '@/components/NeoBackButton';
 
const AlgebraPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleReturn = () => {
    navigate('/mathematics');
  };

  const handleResultGenerated = async (result: {
    question: string;
    answer: string;
    similarQuestions: string[];
  }) => {
    if (user?.id) {
      await saveMessage({
        text: result.question,
        userId: user.id,
        aiResponse: result.answer,
        chatType: 'teacher',
        toolType: 'algebra',
        additionalData: {
          similarQuestions: result.similarQuestions
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NeoBackButton 
        label="Back to Mathematics" 
        color="purple" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-purple p-3 rounded-full mr-4">
          <SquareDot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-kid-purple to-purple-600 bg-clip-text text-transparent">
            Algebra
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Algebra is the branch of mathematics that uses letters and symbols to represent numbers in expressions and equations.
          Ask any question about solving equations, factoring expressions, graphing functions, or other algebraic concepts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-purple/10 p-4 rounded-lg border-2 border-kid-purple/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>How do I solve a quadratic equation?</li>
              <li>How do I factor the expression 3x² + 7x - 10?</li>
              <li>What are the steps to solve systems of linear equations?</li>
              <li>How do I graph the function y = 2x² + 3x - 4?</li>
            </ul>
          </div>
        </div>
      </div>

      <MathQuestionForm topic="Algebra" onResultGenerated={handleResultGenerated} />
    </div>
  );
};

export default AlgebraPage;
