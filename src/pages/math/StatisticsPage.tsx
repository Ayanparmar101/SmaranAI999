
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MathQuestionForm from '@/components/MathQuestionForm';
import { Pi } from 'lucide-react';
import { saveMessage } from '@/utils/messageUtils';
import { useAuth } from '@/contexts/AuthContext';
import NeoBackButton from '@/components/NeoBackButton';

const StatisticsPage = () => {
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
        toolType: 'statistics',
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
        color="orange" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-orange p-3 rounded-full mr-4">
          <Pi className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="gradient-text-animated">
            Statistics
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Statistics is the study of collecting, analyzing, interpreting, and presenting data. Ask questions about 
          probability, distributions, hypothesis testing, regression, or data analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-orange/10 p-4 rounded-lg border-2 border-kid-orange/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>How do I calculate the mean, median, and mode?</li>
              <li>What is standard deviation and how do I interpret it?</li>
              <li>How do I perform a hypothesis test?</li>
              <li>What's the difference between correlation and causation?</li>
            </ul>
          </div>
        </div>
      </div>

      <MathQuestionForm topic="Statistics" onResultGenerated={handleResultGenerated} />
    </div>
  );
};

export default StatisticsPage;
