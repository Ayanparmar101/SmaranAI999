
import React from 'react';
import StudyPlannerContainer from './study-planner/StudyPlannerContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const StudyPlannerPage = () => {
  return (
    <ErrorBoundary>
      <StudyPlannerContainer />
    </ErrorBoundary>
  );
};

export default StudyPlannerPage;
