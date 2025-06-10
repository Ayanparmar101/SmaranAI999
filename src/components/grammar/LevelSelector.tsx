
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LevelSelectorProps {
  selectedLevel: 'beginner' | 'intermediate' | 'advanced';
  onLevelChange: (value: 'beginner' | 'intermediate' | 'advanced') => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ selectedLevel, onLevelChange }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">Select your level:</h2>
      <ToggleGroup
        type="single"
        value={selectedLevel}
        onValueChange={(value) => value && onLevelChange(value as any)}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-center"
      >
        <ToggleGroupItem
          value="beginner"
          className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 text-center whitespace-nowrap"
        >
          Beginner (Grades 1-2)
        </ToggleGroupItem>
        <ToggleGroupItem
          value="intermediate"
          className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 text-center whitespace-nowrap"
        >
          Intermediate (Grades 3-5)
        </ToggleGroupItem>
        <ToggleGroupItem
          value="advanced"
          className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 text-center whitespace-nowrap"
        >
          Advanced (Grades 6-8)
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default LevelSelector;
