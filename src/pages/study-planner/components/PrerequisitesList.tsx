
import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import { Lightbulb } from 'lucide-react';
import { AnimatedList } from '@/components/animations';

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
        <div className="mt-2 h-64">
          <AnimatedList
            items={prerequisites.map(prereq => prereq.topic)}
            showGradients={true}
            enableArrowNavigation={false}
            className="h-full"
            renderItem={(item, index, isSelected) => (
              <div className={`border-l-2 border-[#10B981] pl-3 py-2 ${isSelected ? 'bg-[#10B981]/10' : ''}`}>
                <h4 className="font-medium">{item}</h4>
                <p className="text-sm text-muted-foreground">{prerequisites[index]?.reason}</p>
              </div>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PrerequisitesList;
