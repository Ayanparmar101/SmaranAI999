
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StudyPlan } from './types';

interface IntroCardProps {
  studyPlan: StudyPlan | null;
  progress: number;
}

const IntroCard: React.FC<IntroCardProps> = ({ studyPlan, progress }) => {
  return (
    <Card className="mb-6 border-3 border-black shadow-neo-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#5B86E5]" />
          Study Planner
        </CardTitle>
        <CardDescription>
          Select a chapter and generate a personalized study plan with AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Our AI will analyze your chapter and create a step-by-step study plan, highlighting key topics,
          prerequisites, and an optimal approach to mastering the content.
        </p>
        
        {studyPlan && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Study Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntroCard;
