
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface DifficultySelectorProps {
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (value: 'easy' | 'medium' | 'hard') => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">Select Difficulty:</h2>
      <ToggleGroup
        type="single"
        value={selectedDifficulty}
        onValueChange={(value) => value && onDifficultyChange(value as any)}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-center"
      >
        <ToggleGroupItem
          value="easy"
          className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 bg-green-200/30 text-green-800 data-[state=on]:bg-green-200 data-[state=on]:text-green-800"
        >
          Easy
        </ToggleGroupItem>
        <ToggleGroupItem
          value="medium"
          className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 bg-yellow-200/30 text-yellow-800 data-[state=on]:bg-yellow-200 data-[state=on]:text-yellow-800"
        >
          Medium
        </ToggleGroupItem>
        <ToggleGroupItem
          value="hard"
          className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 bg-red-200/30 text-red-800 data-[state=on]:bg-red-200 data-[state=on]:text-red-800"
        >
          Hard
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default DifficultySelector;
