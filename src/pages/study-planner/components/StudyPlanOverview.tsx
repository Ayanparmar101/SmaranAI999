
import React from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BookOpen, Clock, Brain, Lightbulb, Key, ListChecks } from 'lucide-react';

// Combine props for simplicity
interface StudyPlanOverviewProps {
  chapterTitle: string;
  timeEstimate: string;
  approach: string;
  keyTopics: { topic: string; importance: string }[];
  prerequisites: { topic: string; reason: string }[];
  tips: string[];
}

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-primary">{icon}</span>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
  </div>
);

const StudyPlanOverview: React.FC<StudyPlanOverviewProps> = ({
  chapterTitle,
  timeEstimate,
  approach,
  keyTopics,
  prerequisites,
  tips
}) => {
  return (
    <Card className="border-2 border-border bg-card text-card-foreground shadow-sm print:break-inside-avoid print:shadow-none print:border-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="w-5 h-5 text-primary" />
          Study Plan: {chapterTitle}
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Estimated time: {timeEstimate}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approach Section */}
        {approach && (
          <div>
            <SectionHeader icon={<Brain className="w-5 h-5" />} title="🎯 Approach" />
            <p className="text-muted-foreground text-sm pl-7">{approach}</p>
          </div>
        )}

        {/* Key Topics Section */}
        {Array.isArray(keyTopics) && keyTopics.length > 0 && (
          <div>
            <SectionHeader icon={<Key className="w-5 h-5" />} title="🔑 Key Topics" />
            <ul className="list-disc space-y-1 pl-12 text-sm text-muted-foreground">
              {keyTopics.map((item, index) => (
                <li key={index}>
                  <strong className="text-foreground">{item.topic}:</strong> {item.importance}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites Section */}
        {Array.isArray(prerequisites) && prerequisites.length > 0 && (
          <div>
            <SectionHeader icon={<ListChecks className="w-5 h-5" />} title="📚 Prerequisites" />
            <ul className="list-disc space-y-1 pl-12 text-sm text-muted-foreground">
              {prerequisites.map((item, index) => (
                <li key={index}>
                  <strong className="text-foreground">{item.topic}:</strong> {item.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Study Tips Section */}
        {Array.isArray(tips) && tips.length > 0 && (
          <div>
            <SectionHeader icon={<Lightbulb className="w-5 h-5" />} title="💡 Study Tips" />
            <ul className="list-decimal space-y-1 pl-12 text-sm text-muted-foreground">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyPlanOverview;
