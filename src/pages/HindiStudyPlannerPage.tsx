import React from 'react';
import HindiStudyPlannerContainer from './study-planner/HindiStudyPlannerContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const HindiStudyPlannerPage = () => {
  return (
    <ErrorBoundary>
      <HindiStudyPlannerContainer />
    </ErrorBoundary>
  );
};

export default HindiStudyPlannerPage;
