
import React from 'react';
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { AlarmClock, BookOpen } from 'lucide-react';

interface StudyPlanHeaderProps {
  chapterTitle: string;
  timeEstimate: string;
}

const StudyPlanHeader: React.FC<StudyPlanHeaderProps> = ({
  chapterTitle,
  timeEstimate
}) => {
  return (
    <CardHeader>
      <CardTitle className="text-xl font-bold flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[#5B86E5]" />
        Study Plan: {chapterTitle}
      </CardTitle>
      <CardDescription className="flex items-center gap-2">
        <AlarmClock className="w-4 h-4" />
        Estimated time: {timeEstimate}
      </CardDescription>
    </CardHeader>
  );
};

export default StudyPlanHeader;
