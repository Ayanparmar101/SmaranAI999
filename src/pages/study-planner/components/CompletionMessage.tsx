
import React from 'react';
import { CheckCheck } from 'lucide-react';

const CompletionMessage: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg flex items-center gap-3">
      <CheckCheck className="w-5 h-5 text-[#10B981]" />
      <div>
        <h4 className="font-medium text-[#10B981]">Study plan completed!</h4>
        <p className="text-sm text-muted-foreground">
          Great job completing all study steps. You're ready for an assessment on this chapter.
        </p>
      </div>
    </div>
  );
};

export default CompletionMessage;
