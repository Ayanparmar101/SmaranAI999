import React from 'react';
import { useNavigate } from 'react-router-dom';
import MathQuestionForm from '@/components/MathQuestionForm';
import { BrainCircuit } from 'lucide-react'; 
import { saveMessage } from '@/utils/messageUtils';
import { useAuth } from '@/contexts/AuthContext';
import NeoBackButton from '@/components/NeoBackButton';

const ProblemSolvingPage = () => {
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
        toolType: 'problem-solving',
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
        color="red" // Updated back button color to red
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-red p-3 rounded-full mr-4"> {/* Updated icon background to red */} 
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
        {/* Updated heading style: Applied solid red color */}
        <h1 className="text-3xl md:text-4xl font-bold text-kid-red">
          Problem Solving
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Problem solving involves using mathematical skills to solve real-world or abstract challenges. 
          Ask questions involving word problems, logic puzzles, multi-step calculations, or strategy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Updated example box style to red theme */} 
          <div className="bg-kid-red/10 p-4 rounded-lg border-2 border-kid-red/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>A train travels 150 miles in 3 hours. What is its average speed?</li>
              <li>If 5 apples cost $2.50, how much would 8 apples cost?</li>
              <li>How many different ways can you arrange the letters in the word MATH?</li>
              <li>I have $50 and want to buy items costing $12.50, $23.75, and $9.80. Do I have enough money?</li>
            </ul>
          </div>
        </div>
      </div>

      <MathQuestionForm topic="Problem Solving" onResultGenerated={handleResultGenerated} />
    </div>
  );
};

export default ProblemSolvingPage;
