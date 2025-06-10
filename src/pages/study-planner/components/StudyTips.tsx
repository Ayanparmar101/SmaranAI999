
import React from 'react';
import { 
  AccordionItem, 
  AccordionTrigger,
  AccordionContent 
} from '@/components/ui/accordion';
import { LightbulbIcon } from 'lucide-react';

interface StudyTipsProps {
  tips: string[];
}

const StudyTips: React.FC<StudyTipsProps> = ({ tips }) => {
  if (!tips || tips.length === 0) return null;
  
  return (
    <AccordionItem value="study-tips">
      <AccordionTrigger className="py-3">
        <div className="flex items-center gap-2">
          <LightbulbIcon className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-semibold">Study Tips</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-2 mt-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-[#F59E0B]">{index + 1}</span>
              </div>
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export default StudyTips;
