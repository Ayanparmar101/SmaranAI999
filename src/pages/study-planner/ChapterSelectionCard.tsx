
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Book, Brain, Save } from 'lucide-react';
import ChapterSelector from '../teacher/ChapterSelector';
import DoodleButton from '@/components/DoodleButton';
// Removed: import { ChapterPDFUploader } from '@/components/ChapterPDFUploader';

interface ChapterSelectionCardProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedBook: string;
  setSelectedBook: (value: string) => void;
  selectedChapter: string;
  setSelectedChapter: (value: string) => void;
  generateStudyPlan: () => void;
  isGenerating: boolean;
  // Removed: handleFileUpload: (file: File, publicUrl: string | null) => void;
  onSaveStudyPlan?: () => void;
  canSave?: boolean;
}

const ChapterSelectionCard: React.FC<ChapterSelectionCardProps> = ({
  selectedClass,
  setSelectedClass,
  selectedBook,
  setSelectedBook,
  selectedChapter,
  setSelectedChapter,
  generateStudyPlan,
  isGenerating,
  // Removed: handleFileUpload,
  onSaveStudyPlan,
  canSave = false
}) => {
  return (
    <Card className="border-3 border-black shadow-neo-md print:hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Book className="w-5 h-5 text-[#5B86E5]" />
          Select Chapter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChapterSelector
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          selectedChapter={selectedChapter}
          setSelectedChapter={setSelectedChapter}
        />
        
        {selectedChapter && (
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Removed ChapterPDFUploader component */}
            <DoodleButton 
              onClick={generateStudyPlan}
              loading={isGenerating}
              icon={<Brain size={18} />}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating Plan..." : "Generate Study Plan"}
            </DoodleButton>
            
            {onSaveStudyPlan && (
              <DoodleButton
                onClick={onSaveStudyPlan}
                disabled={!canSave}
                icon={<Save size={18} />}
                color="green"
              >
                Save Plan
              </DoodleButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterSelectionCard;
