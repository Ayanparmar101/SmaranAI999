import React from 'react';
import GujaratiStudyPlannerContainer from './study-planner/GujaratiStudyPlannerContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const GujaratiStudyPlannerPage = () => {
  return (
    <ErrorBoundary>
      <GujaratiStudyPlannerContainer />
    </ErrorBoundary>
  );
};

export default GujaratiStudyPlannerPage;
