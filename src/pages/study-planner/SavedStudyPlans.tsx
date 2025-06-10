import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getUserMessages, FirebaseMessage } from '@/services/firebaseMessageService';
import { BookOpen, Calendar, Clock, Eye, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import StudyPlanDisplay from './StudyPlanDisplay';
import { StudyPlan } from './types';

interface SavedStudyPlansProps {
  onLoadStudyPlan?: (studyPlan: any) => void;
}

const SavedStudyPlans: React.FC<SavedStudyPlansProps> = ({ onLoadStudyPlan }) => {
  const { user } = useAuth();
  const [savedPlans, setSavedPlans] = useState<FirebaseMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const fetchSavedPlans = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const messages = await getUserMessages(user.uid);
      // Filter for study planner messages
      const studyPlanMessages = messages.filter(msg => msg.chatType === 'study-planner');
      setSavedPlans(studyPlanMessages);
    } catch (error) {
      console.error('Error fetching saved study plans:', error);
      toast.error('Failed to load saved study plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlans();
  }, [user?.uid]);

  const handleViewPlan = (message: FirebaseMessage) => {
    try {
      const studyPlan = JSON.parse(message.aiResponse || '{}');
      setSelectedPlan(studyPlan);
      setShowPlanDetails(true);
    } catch (error) {
      console.error('Error parsing study plan:', error);
      toast.error('Failed to load study plan details');
    }
  };

  const handleLoadPlan = (message: FirebaseMessage) => {
    try {
      const studyPlan = JSON.parse(message.aiResponse || '{}');
      if (onLoadStudyPlan) {
        onLoadStudyPlan(studyPlan);
        toast.success('Study plan loaded successfully!');
      }
    } catch (error) {
      console.error('Error loading study plan:', error);
      toast.error('Failed to load study plan');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    let date: Date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectBadgeColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'science': return 'bg-green-100 text-green-800';
      case 'hindi': return 'bg-orange-100 text-orange-800';
      case 'gujarati': return 'bg-red-100 text-red-800';
      case 'social-science': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (showPlanDetails && selectedPlan) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Saved Study Plan Details
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowPlanDetails(false)}
            >
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <StudyPlanDisplay 
            studyPlan={selectedPlan} 
            onStepComplete={() => {}} // Read-only mode
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Saved Study Plans ({savedPlans.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSavedPlans}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading saved study plans...</p>
          </div>
        ) : savedPlans.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Saved Study Plans</h3>
            <p className="text-muted-foreground">
              Create and save study plans to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPlans.map((plan) => {
              const additionalData = plan.additionalData || {};
              const subject = additionalData.subject || 'general';
              
              return (
                <Card key={plan.id} className="border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{plan.text}</h3>
                          <Badge className={getSubjectBadgeColor(subject)}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(plan.timestamp)}
                          </div>
                          {additionalData.book_id && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {additionalData.book_id}
                            </div>
                          )}
                        </div>

                        {additionalData.progress && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{Math.round(additionalData.progress.completionPercentage || 0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${additionalData.progress.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPlan(plan)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {onLoadStudyPlan && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleLoadPlan(plan)}
                            className="flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Load
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedStudyPlans;
