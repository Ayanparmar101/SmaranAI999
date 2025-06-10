
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface QuestionCountSelectorProps {
  numQuestions: number;
  onNumQuestionsChange: (value: number) => void;
}

const QuestionCountSelector: React.FC<QuestionCountSelectorProps> = ({
  numQuestions,
  onNumQuestionsChange
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">Number of Questions: {numQuestions}</h2>
      <div className="px-3 sm:px-4 py-3 sm:py-2 bg-white border-3 border-black rounded-md shadow-neo-sm max-w-md mx-auto">
        <Slider
          value={[numQuestions]}
          max={10}
          min={1}
          step={1}
          onValueChange={(value) => {
            console.log("Slider value changed to:", value[0]);
            onNumQuestionsChange(value[0]);
          }}
          className="w-full min-h-[44px] flex items-center"
        />
        <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCountSelector;
