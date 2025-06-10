import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

// Optimized Loader Component with skeleton UI
const PageLoader = () => (
  <div className="container mx-auto p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-muted rounded w-64"></div>
    <div className="grid gap-4">
      <div className="h-32 bg-muted rounded"></div>
      <div className="h-32 bg-muted rounded"></div>
      <div className="h-32 bg-muted rounded"></div>
    </div>
  </div>
);

// Lazy load pages
const Index = lazy(() => import('@/pages/Index'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const FirebaseHistoryPage = lazy(() => import('@/pages/FirebaseHistoryPage'));
const VoiceAssistantPage = lazy(() => import('@/pages/VoiceAssistantPage'));
const TeacherPage = lazy(() => import('@/pages/TeacherPage'));
const SocraticTutorPage = lazy(() => import('@/pages/SocraticTutorPage'));
const GrammarPage = lazy(() => import('@/pages/GrammarPage'));
const MathLearnerPage = lazy(() => import('@/pages/MathLearnerPage'));
const ScienceLearnerPage = lazy(() => import('@/pages/ScienceLearnerPage'));
const SocialScienceLearnerPage = lazy(() => import('@/pages/SocialScienceLearnerPage'));
const StoryImagesPage = lazy(() => import('@/pages/StoryImagesPage'));
const VoiceBotPage = lazy(() => import('@/pages/VoiceBotPage'));
const StudyPlannerPage = lazy(() => import('@/pages/StudyPlannerPage'));
const ScienceStudyPlannerPage = lazy(() => import('@/pages/ScienceStudyPlannerPage'));
const SocialScienceStudyPlannerPage = lazy(() => import('@/pages/SocialScienceStudyPlannerPage'));
const HindiStudyPlannerPage = lazy(() => import('@/pages/HindiStudyPlannerPage'));
const GujaratiStudyPlannerPage = lazy(() => import('@/pages/GujaratiStudyPlannerPage'));

const PomodoroPage = lazy(() => import('@/pages/PomodoroPage'));
const SubjectsPage = lazy(() => import('@/pages/SubjectsPage'));
const MathematicsPage = lazy(() => import('@/pages/MathematicsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const HindiPage = lazy(() => import('@/pages/HindiPage'));
const HindiChatbotPage = lazy(() => import('@/pages/HindiChatbotPage'));
const HindiGrammarPage = lazy(() => import('@/pages/HindiGrammarPage'));
const GujaratiPage = lazy(() => import('@/pages/GujaratiPage'));
const GujaratiChatbotPage = lazy(() => import('@/pages/GujaratiChatbotPage'));
const SciencePage = lazy(() => import('@/pages/SciencePage'));
const ScienceChatbotPage = lazy(() => import('@/pages/ScienceChatbotPage'));
const ScienceTeacherPage = lazy(() => import('@/pages/ScienceTeacherPage'));
const SocialSciencePage = lazy(() => import('@/pages/SocialSciencePage'));
const SocialScienceChatbotPage = lazy(() => import('@/pages/SocialScienceChatbotPage'));
const SocialScienceTeacherPage = lazy(() => import('@/pages/SocialScienceTeacherPage'));
const HindiTeacherPage = lazy(() => import('@/pages/HindiTeacherPage'));
const GujaratiTeacherPage = lazy(() => import('@/pages/GujaratiTeacherPage'));
const MathematicsTeacherPage = lazy(() => import('@/pages/MathematicsTeacherPage'));
const EnglishPage = lazy(() => import('@/pages/EnglishPage'));
const TransitionDemoPage = lazy(() => import('@/pages/TransitionDemoPage'));

// Flashcard Pages
const FlashcardGeneratorPage = lazy(() => import('@/pages/FlashcardGeneratorPage'));

// Helper function to wrap element with Suspense and PageTransition
const suspenseWrapper = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    <PageTransition>
      {element}
    </PageTransition>
  </Suspense>
);

export const mainRoutes: RouteObject[] = [
  { path: '/', element: suspenseWrapper(<Index />) },
  { path: '/history', element: suspenseWrapper(<HistoryPage />) },
  { path: '/firebase-history', element: suspenseWrapper(<FirebaseHistoryPage />) },
  { path: '/voice-assistant', element: suspenseWrapper(<VoiceAssistantPage />) },
  { path: '/teacher', element: suspenseWrapper(<TeacherPage />) },
  { path: '/socratic-tutor', element: suspenseWrapper(<SocraticTutorPage />) },
  { path: '/grammar', element: suspenseWrapper(<GrammarPage />) },
  { path: '/math-learner', element: suspenseWrapper(<MathLearnerPage />) },
  { path: '/science-learner', element: suspenseWrapper(<ScienceLearnerPage />) },
  { path: '/social-science-learner', element: suspenseWrapper(<SocialScienceLearnerPage />) },
  { path: '/story-images', element: suspenseWrapper(<StoryImagesPage />) },
  { path: '/voice-bot', element: suspenseWrapper(<VoiceBotPage />) },
  { path: '/study-planner', element: suspenseWrapper(<StudyPlannerPage />) },
  { path: '/science/study-planner', element: suspenseWrapper(<ScienceStudyPlannerPage />) },
  { path: '/social-science/study-planner', element: suspenseWrapper(<SocialScienceStudyPlannerPage />) },
  { path: '/hindi/study-planner', element: suspenseWrapper(<HindiStudyPlannerPage />) },
  { path: '/gujarati/study-planner', element: suspenseWrapper(<GujaratiStudyPlannerPage />) },
  { path: '/flashcards', element: suspenseWrapper(<FlashcardGeneratorPage />) },

  { path: '/pomodoro', element: suspenseWrapper(<PomodoroPage />) },
  { path: '/subjects', element: suspenseWrapper(<SubjectsPage />) },
  { path: '/mathematics', element: suspenseWrapper(<MathematicsPage />) },
  { path: '/mathematics/teacher', element: suspenseWrapper(<MathematicsTeacherPage />) },
  { path: '/profile', element: suspenseWrapper(<ProfilePage />) },
  { path: '/hindi', element: suspenseWrapper(<HindiPage />) },
  { path: '/hindi/chatbot', element: suspenseWrapper(<HindiChatbotPage />) },
  { path: '/hindi/grammar', element: suspenseWrapper(<HindiGrammarPage />) },
  { path: '/hindi/teacher', element: suspenseWrapper(<HindiTeacherPage />) },
  { path: '/gujarati', element: suspenseWrapper(<GujaratiPage />) },
  { path: '/gujarati/chatbot', element: suspenseWrapper(<GujaratiChatbotPage />) },
  { path: '/gujarati/teacher', element: suspenseWrapper(<GujaratiTeacherPage />) },
  { path: '/science', element: suspenseWrapper(<SciencePage />) },
  { path: '/science/chatbot', element: suspenseWrapper(<ScienceChatbotPage />) },
  { path: '/science/teacher', element: suspenseWrapper(<ScienceTeacherPage />) },
  { path: '/social-science', element: suspenseWrapper(<SocialSciencePage />) },
  { path: '/social-science/chatbot', element: suspenseWrapper(<SocialScienceChatbotPage />) },
  { path: '/social-science/teacher', element: suspenseWrapper(<SocialScienceTeacherPage />) },
  { path: '/english', element: suspenseWrapper(<EnglishPage />) },
  { path: '/transition-demo', element: suspenseWrapper(<TransitionDemoPage />) },

  { path: '*', element: suspenseWrapper(<NotFound />) } // Also lazy load NotFound
];
