import React from 'react';
import { useNavigate } from 'react-router-dom';
import MathQuestionForm from '@/components/MathQuestionForm';
import { PenTool } from 'lucide-react';
import { saveMessage } from '@/utils/messageUtils';
import { useAuth } from '@/contexts/AuthContext';
import NeoBackButton from '@/components/NeoBackButton';

const GeometryPage = () => {
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
        color="green" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-green p-3 rounded-full mr-4">
          <PenTool className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="gradient-text-animated">
            Geometry
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Geometry is the study of shapes, sizes, and properties of space. Ask questions about angles, 
          triangles, circles, areas, volumes, coordinate geometry, or proofs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-green/10 p-4 rounded-lg border-2 border-kid-green/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>How do I find the area of a trapezoid?</li>
              <li>What is the Pythagorean theorem and how is it used?</li>
              <li>How do I calculate the volume of a cone?</li>
              <li>What are the properties of similar triangles?</li>
            </ul>
          </div>
        </div>
      </div>

      <MathQuestionForm topic="Geometry" onResultGenerated={handleResultGenerated} />
    </div>
  );
};

export default GeometryPage;
