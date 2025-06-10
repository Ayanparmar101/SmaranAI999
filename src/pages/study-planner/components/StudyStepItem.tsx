
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { StudyPlanStep } from '../types';

interface StudyStepItemProps {
  step: StudyPlanStep;
  index: number;
  onComplete: (index: number) => void;
}

const StudyStepItem: React.FC<StudyStepItemProps> = ({ step, index, onComplete }) => {
  return (
    <li 
      className={cn(
        "rounded-lg border p-4 transition-all",
        step.completed 
          ? "bg-muted/50 border-muted" 
          : "hover:border-[#5B86E5] hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          id={`step-${index}`}
          checked={step.completed}
          onCheckedChange={() => onComplete(index)}
          className="mt-1"
        />
        <div className="space-y-1">
          <label 
            htmlFor={`step-${index}`}
            className={cn(
              "font-medium cursor-pointer flex items-center gap-2",
              step.completed && "line-through text-muted-foreground"
            )}
          >
            {step.title}
            <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {step.timeAllocation}
            </span>
          </label>
          <p className={cn(
            "text-sm text-muted-foreground",
            step.completed && "line-through"
          )}>
            {step.description}
          </p>
        </div>
      </div>
    </li>
  );
};

export default StudyStepItem;
