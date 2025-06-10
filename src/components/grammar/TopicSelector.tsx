
import React from 'react';

interface TopicSelectorProps {
  topics: string[];
  selectedTopic: string;
  onTopicSelect: (topic: string) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  selectedTopic,
  onTopicSelect
}) => {
  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">Choose a topic to study:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => onTopicSelect(topic)}
            className={`p-3 sm:p-4 border-3 border-black rounded-xl transition-all min-h-[48px] sm:min-h-[44px] text-sm sm:text-base font-medium text-center ${
              selectedTopic === topic
                ? 'bg-kid-green text-white shadow-none translate-y-1'
                : 'bg-white shadow-neo-sm hover:shadow-none hover:translate-y-1'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;
