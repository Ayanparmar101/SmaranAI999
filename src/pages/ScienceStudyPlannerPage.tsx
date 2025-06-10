import React from 'react';
import ScienceStudyPlannerContainer from './study-planner/ScienceStudyPlannerContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const ScienceStudyPlannerPage = () => {
  return (
    <ErrorBoundary>
      <ScienceStudyPlannerContainer />
    </ErrorBoundary>
  );
};

export default ScienceStudyPlannerPage;
