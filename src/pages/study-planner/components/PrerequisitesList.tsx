
import React from 'react';
import { 
  AccordionItem, 
  AccordionTrigger,
  AccordionContent 
} from '@/components/ui/accordion';
import { Lightbulb } from 'lucide-react';

interface Prerequisite {
  topic: string;
  reason: string;
}

interface PrerequisitesListProps {
  prerequisites: Prerequisite[];
}

const PrerequisitesList: React.FC<PrerequisitesListProps> = ({ prerequisites }) => {
  if (prerequisites.length === 0) return null;
  
  return (
    <AccordionItem value="prerequisites">
      <AccordionTrigger className="py-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#10B981]" />
          <span className="font-semibold">Prerequisites</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-3 mt-2">
          {prerequisites.map((prereq, index) => (
            <li key={index} className="border-l-2 border-[#10B981] pl-3 py-1">
              <h4 className="font-medium">{prereq.topic}</h4>
              <p className="text-sm text-muted-foreground">{prereq.reason}</p>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PrerequisitesList;
