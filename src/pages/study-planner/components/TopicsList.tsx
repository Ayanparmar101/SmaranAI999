
import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import { Key } from 'lucide-react';
import { AnimatedList } from '@/components/animations';

interface Topic {
  topic: string;
  importance: string;
}

interface TopicsListProps {
  topics: Topic[];
}

const TopicsList: React.FC<TopicsListProps> = ({ topics }) => {
  return (
    <AccordionItem value="key-topics">
      <AccordionTrigger className="py-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-semibold">Key Topics</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="mt-2 h-64">
          <AnimatedList
            items={topics.map(topic => topic.topic)}
            showGradients={true}
            enableArrowNavigation={false}
            className="h-full"
            renderItem={(item, index, isSelected) => (
              <div className={`border-l-2 border-[#F59E0B] pl-3 py-2 ${isSelected ? 'bg-[#F59E0B]/10' : ''}`}>
                <h4 className="font-medium">{item}</h4>
                <p className="text-sm text-muted-foreground">{topics[index]?.importance}</p>
              </div>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TopicsList;
