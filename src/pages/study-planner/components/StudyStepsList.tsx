
import React from 'react';
import { ListChecks } from 'lucide-react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { StudyPlanStep } from '../types';
import StudyStepItem from './StudyStepItem';
import CompletionMessage from './CompletionMessage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatedList } from '@/components/animations';

interface StudyStepsListProps {
  steps: StudyPlanStep[];
  completionPercentage: number;
  onStepComplete: (index: number) => void;
}

const StudyStepsList: React.FC<StudyStepsListProps> = ({
  steps,
  completionPercentage,
  onStepComplete
}) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-[#EF4444]" />
          <span className="font-semibold">Study Steps</span>
        </CardTitle>
        <CardDescription>
          Complete each step and track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorBoundary>
          <div className="h-96">
            <AnimatedList
              items={steps.map((step, index) => `Step ${index + 1}: ${step.title}`)}
              showGradients={true}
              enableArrowNavigation={false}
              className="h-full"
              renderItem={(item, index, isSelected) => (
                <StudyStepItem
                  step={steps[index]}
                  index={index}
                  onComplete={onStepComplete}
                />
              )}
            />
          </div>

          {completionPercentage === 100 && <CompletionMessage />}
        </ErrorBoundary>
      </CardContent>
    </>
  );
};

export default StudyStepsList;
