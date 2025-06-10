import React from 'react';
import SocialScienceStudyPlannerContainer from './study-planner/SocialScienceStudyPlannerContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const SocialScienceStudyPlannerPage = () => {
  return (
    <ErrorBoundary>
      <SocialScienceStudyPlannerContainer />
    </ErrorBoundary>
  );
};

export default SocialScienceStudyPlannerPage;
