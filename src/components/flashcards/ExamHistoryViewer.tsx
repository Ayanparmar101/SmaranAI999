import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Trophy, BarChart3, BookOpen } from 'lucide-react';
import { examResultService } from '@/services/examResultService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExamSession {
  id: string;
  flashcardSetId: string;
  flashcardSetTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  avgTimePerQuestion: number;
  completedAt: Date;
  settings: {
    timePerQuestion: number;
    shuffleQuestions: boolean;
    showDifficulty: boolean;
    useAIEvaluation: boolean;
  };
}

interface ExamHistoryViewerProps {
  flashcardSetId?: string; // If provided, show history for specific set only
  flashcardSetTitle?: string;
}

const ExamHistoryViewer: React.FC<ExamHistoryViewerProps> = ({ 
  flashcardSetId, 
  flashcardSetTitle 
}) => {
  const { user } = useAuth();
  const [examHistory, setExamHistory] = useState<ExamSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamSession | null>(null);

  useEffect(() => {
    if (user) {
      loadExamHistory();
    }
  }, [user, flashcardSetId]);

  const loadExamHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const history = await examResultService.getExamHistory(user.uid, flashcardSetId);
      setExamHistory(history);
    } catch (error) {
      console.error('Error loading exam history:', error);
      toast.error('Failed to load exam history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
    if (score >= 70) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
  };

  const getPerformanceTrend = (): { trend: 'up' | 'down' | 'stable'; message: string } => {
    if (examHistory.length < 2) return { trend: 'stable', message: 'Need more exams to show trend' };
    
    const recent = examHistory.slice(0, 3);
    const avgRecentScore = recent.reduce((sum, exam) => sum + exam.score, 0) / recent.length;
    
    const older = examHistory.slice(3, 6);
    if (older.length === 0) return { trend: 'stable', message: 'Not enough data for trend' };
    
    const avgOlderScore = older.reduce((sum, exam) => sum + exam.score, 0) / older.length;
    
    const difference = avgRecentScore - avgOlderScore;
    
    if (difference > 5) return { trend: 'up', message: `Improving! +${difference.toFixed(1)}% average` };
    if (difference < -5) return { trend: 'down', message: `Declining -${Math.abs(difference).toFixed(1)}% average` };
    return { trend: 'stable', message: 'Stable performance' };
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Please sign in to view exam history</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (examHistory.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Exam History</h3>
        <p className="text-muted-foreground">
          {flashcardSetTitle 
            ? `No exams taken for "${flashcardSetTitle}" yet.`
            : "You haven't taken any exams yet."
          }
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Take an exam to see your performance history here!
        </p>
      </Card>
    );
  }

  const performanceTrend = getPerformanceTrend();
  const avgScore = examHistory.reduce((sum, exam) => sum + exam.score, 0) / examHistory.length;
  const totalExams = examHistory.length;
  const totalQuestionsAnswered = examHistory.reduce((sum, exam) => sum + exam.totalQuestions, 0);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 dark:bg-card dark:border-border">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <div>
              <div className="text-2xl font-bold dark:text-foreground">{avgScore.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 dark:bg-card dark:border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold dark:text-foreground">{totalExams}</div>
              <div className="text-sm text-muted-foreground">Total Exams</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 dark:bg-card dark:border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold dark:text-foreground">{totalQuestionsAnswered}</div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 dark:bg-card dark:border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <div>
              <div className="text-sm font-medium dark:text-foreground">{performanceTrend.message}</div>
              <div className="text-xs text-muted-foreground">Performance Trend</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Exam History List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {flashcardSetTitle ? `Exam History for "${flashcardSetTitle}"` : 'All Exam History'}
        </h3>
        
        <div className="space-y-4">
          {examHistory.map((exam) => (
            <Card 
              key={exam.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedExam(selectedExam?.id === exam.id ? null : exam)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={getScoreColor(exam.score)}>
                    {exam.score.toFixed(1)}%
                  </Badge>
                  
                  <div>
                    <div className="font-medium">
                      {exam.flashcardSetTitle}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exam.correctAnswers}/{exam.totalQuestions} correct
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(exam.totalTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(exam.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {selectedExam?.id === exam.id && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Time per Question:</span>
                      <div>{formatTime(exam.avgTimePerQuestion)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Time Limit:</span>
                      <div>{exam.settings.timePerQuestion}s</div>
                    </div>
                    <div>
                      <span className="font-medium">Shuffled:</span>
                      <div>{exam.settings.shuffleQuestions ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="font-medium">AI Evaluation:</span>
                      <div>{exam.settings.useAIEvaluation ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
        
        {examHistory.length > 5 && (
          <div className="text-center mt-4">
            <Button variant="outline" onClick={loadExamHistory}>
              Load More
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExamHistoryViewer;
