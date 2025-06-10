
import React from 'react';
import { StudyPlan, StudyPlanDay, StudyPlanTask } from './types';
import { Button } from '@/components/ui/button';
import { FileText, Printer, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StudyPlanDisplayProps {
  studyPlan: StudyPlan | null | undefined;
  onStepComplete: (dayIndex: number, taskIndex: number) => void;
}

const StudyPlanDisplay: React.FC<StudyPlanDisplayProps> = ({
  studyPlan,
  onStepComplete
}) => {
  const handlePrint = () => {
    // Get the study plan content
    const studyPlanElement = document.querySelector('.study-plan-print-area');
    if (!studyPlanElement) {
      toast.error('Study plan content not found.');
      return;
    }

    // Clone the element to avoid modifying the original
    const clonedElement = studyPlanElement.cloneNode(true) as HTMLElement;

    // Remove interactive elements that shouldn't be printed
    const elementsToRemove = [
      'button',
      '.print\\:hidden',
      '[class*="print:hidden"]'
    ];

    elementsToRemove.forEach(selector => {
      try {
        const elements = clonedElement.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      } catch (e) {
        // Continue if selector fails
      }
    });

    // Create a temporary container for printing
    const printContainer = document.createElement('div');
    printContainer.innerHTML = `
      <style>
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
          .print\\:hidden { display: none !important; }
        }
        .print-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .print-container h1, .print-container h2, .print-container h3 {
          color: #2563eb;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .print-container h1 {
          font-size: 1.8em;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 0.5em;
        }
        .print-container h2 { font-size: 1.4em; }
        .print-container h3 { font-size: 1.2em; }
        .print-container ul { margin: 0.5em 0; padding-left: 1.5em; }
        .print-container li { margin: 0.25em 0; }
        .print-container .font-semibold { font-weight: 600; }
        .print-container .font-bold { font-weight: 700; }
        .print-container .text-muted-foreground { color: #6b7280; }
        .print-container .border-l-2 { border-left: 3px solid #2563eb; padding-left: 1em; }
        .print-container .mb-6 { margin-bottom: 1.5em; }
        .print-container .mb-3 { margin-bottom: 0.75em; }
        .print-container .mb-2 { margin-bottom: 0.5em; }
        .print-container .mt-6 { margin-top: 1.5em; }
        .print-container .pt-4 { padding-top: 1em; }
        .print-container .border-t { border-top: 1px solid #e5e7eb; }
      </style>
      <div class="print-container">
        ${clonedElement.innerHTML}
      </div>
    `;

    // Add to document temporarily
    document.body.appendChild(printContainer);

    // Print
    window.print();

    // Remove the temporary container
    document.body.removeChild(printContainer);
  };

  const handleExportToPDF = () => {
    toast.info("PDF export functionality will be added soon!");
  };

  if (!studyPlan) {
    return <Card><CardContent><p className='text-muted-foreground p-4'>Generating study plan...</p></CardContent></Card>;
  }

  // Determine the correct steps array (structure or steps)
  const planSteps = studyPlan.structure || studyPlan.steps || [];
  const planDuration = studyPlan.duration || studyPlan.timeEstimate;

  return (
    <Card className="study-plan-print-area">
      <CardHeader>
        <CardTitle className='text-2xl font-bold mb-2'>
          Study Plan: {studyPlan.chapterTitle || 'Selected Chapter'}
        </CardTitle>
        {planDuration && (
          <div className="text-sm text-muted-foreground mb-4">
            Estimated Duration: <Badge variant="outline">{planDuration}</Badge>
          </div>
        )}
        <div className="flex justify-end gap-2 print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            Print Plan
          </Button>
          {/* <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExportToPDF}
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button> */}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Approach */}
        {studyPlan.approach && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Approach</h3>
            <p className="text-muted-foreground text-sm">{studyPlan.approach}</p>
          </div>
        )}

        {/* Prerequisites */}
        {Array.isArray(studyPlan.prerequisites) && studyPlan.prerequisites.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Prior Knowledge Needed</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {studyPlan.prerequisites.map((item, index) => (
                <li key={index}>
                  <strong>{item.topic}:</strong> {item.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Key Topics */}
        {Array.isArray(studyPlan.keyTopics) && studyPlan.keyTopics.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Topics</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {studyPlan.keyTopics.map((item, index) => (
                <li key={index}>
                  <strong>{item.topic}</strong>
                  {item.importance && <span className='ml-2'>- {item.importance}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Daily Plan */}
        <div>
            <h2 className="text-xl font-semibold mt-6 mb-4 border-t pt-4">Daily Breakdown</h2>
            {Array.isArray(planSteps) && planSteps.length > 0 ? (
              planSteps.map((day: StudyPlanDay, dayIndex: number) => (
                <div key={dayIndex} className="mb-6 pl-4 border-l-2 border-primary/20">
                  <h3 className="text-lg font-semibold mb-3">
                    Day {day.day}: {day.title}
                  </h3>
                  {Array.isArray(day.tasks) && day.tasks.map((task: StudyPlanTask, taskIndex: number) => (
                    <div key={taskIndex} className="mb-3 flex items-start gap-2">
                      <button 
                        onClick={() => onStepComplete(dayIndex, taskIndex)} 
                        className="mt-1 print:hidden focus:outline-none focus:ring-1 focus:ring-primary rounded"
                        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className={`flex-1 ${task.completed ? 'opacity-70 line-through' : ''}`}>
                        <p className="font-medium text-sm">
                          {task.name} 
                          {task.duration && <span className="text-xs text-muted-foreground ml-2">({task.duration})</span>}
                        </p>
                        <p className="text-sm text-muted-foreground ml-1">{task.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className='text-muted-foreground'>No daily steps provided in the plan.</p>
            )}
        </div>

        {/* Tips */}
        {Array.isArray(studyPlan.tips) && studyPlan.tips.length > 0 && (
          <div className='border-t pt-4'>
            <h3 className="text-lg font-semibold mb-2">💡 Study Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {studyPlan.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};

export default StudyPlanDisplay;
