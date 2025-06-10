
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MathQuestionForm from '@/components/MathQuestionForm';
import { Sigma } from 'lucide-react';
import { saveMessage } from '@/utils/messageUtils';
import { useAuth } from '@/contexts/AuthContext';
import NeoBackButton from '@/components/NeoBackButton';

const CalculusPage = () => {
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
        toolType: 'calculus',
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
        color="yellow" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-yellow p-3 rounded-full mr-4">
          <Sigma className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-kid-yellow to-amber-500 bg-clip-text text-transparent">
            Calculus
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Calculus is the mathematical study of continuous change. Ask questions about limits, derivatives, 
          integrals, differential equations, or applications of calculus.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-yellow/10 p-4 rounded-lg border-2 border-kid-yellow/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>How do I find the derivative of f(x) = x³ - 2x² + 5x - 3?</li>
              <li>What is the chain rule and how do I use it?</li>
              <li>How do I integrate ∫x²e^x dx?</li>
              <li>What is a limit and how do I evaluate it?</li>
            </ul>
          </div>
        </div>
      </div>

      <MathQuestionForm topic="Calculus" onResultGenerated={handleResultGenerated} />
    </div>
  );
};

export default CalculusPage;
