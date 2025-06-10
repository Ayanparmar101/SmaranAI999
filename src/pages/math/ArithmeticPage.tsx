
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MathQuestionForm from '@/components/MathQuestionForm';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NeoBackButton from '@/components/NeoBackButton';

const ArithmeticPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleReturn = () => {
    navigate('/mathematics');
  };

  // The MathQuestionForm component now handles the parsing, symbol representation, and saving logic internally.
  // We just need to pass the topic.

  return (
    <div className="container mx-auto px-4 py-8">
      <NeoBackButton 
        label="Back to Mathematics" 
        color="blue" 
        onClick={handleReturn}
      />

      <div className="flex items-center mb-8">
        <div className="bg-kid-blue p-3 rounded-full mr-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="gradient-text-animated">
            Arithmetic
          </span>
        </h1>
      </div>

      {/* Restoring the description and examples section */}
      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Arithmetic is the branch of mathematics dealing with properties and manipulation of numbers. 
          Ask questions about addition, subtraction, multiplication, division, fractions, or any basic number operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-kid-blue/10 p-4 rounded-lg border-2 border-kid-blue/30">
            <h3 className="font-bold mb-2">Example Questions:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>How do I add fractions with different denominators?</li>
              <li>What's the long division method for 5678 ÷ 32?</li>
              <li>How do I convert a decimal to a fraction?</li>
              <li>What is the order of operations (PEMDAS) and why is it important?</li>
            </ul>
          </div>
          {/* You can add another info box here if needed */}
        </div>
      </div>

      {/* Restoring the MathQuestionForm */}
      <MathQuestionForm topic="Arithmetic" />
    </div>
  );
};

export default ArithmeticPage;
