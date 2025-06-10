
import React from 'react';
import { Brain } from 'lucide-react';

interface ApproachSectionProps {
  approach: string;
}

const ApproachSection: React.FC<ApproachSectionProps> = ({ approach }) => {
  return (
    <div>
      <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
        <Brain className="w-4 h-4 text-[#8B5CF6]" />
        Approach
      </h3>
      <p className="text-muted-foreground">{approach}</p>
    </div>
  );
};

export default ApproachSection;
