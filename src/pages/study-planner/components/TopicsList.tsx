
import React from 'react';
import { 
  AccordionItem, 
  AccordionTrigger,
  AccordionContent 
} from '@/components/ui/accordion';
import { Key } from 'lucide-react';

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
        <ul className="space-y-3 mt-2">
          {topics.map((topic, index) => (
            <li key={index} className="border-l-2 border-[#F59E0B] pl-3 py-1">
              <h4 className="font-medium">{topic.topic}</h4>
              <p className="text-sm text-muted-foreground">{topic.importance}</p>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TopicsList;
