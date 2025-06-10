
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { StudyDay } from '../types';
import { Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DayPlanCardProps {
  day: StudyDay;
  dayIndex: number;
  onTaskComplete: (taskIndex: number) => void;
}

const DayPlanCard: React.FC<DayPlanCardProps> = ({ day, dayIndex, onTaskComplete }) => {
  const completedTasks = day.tasks.filter(task => task.completed).length;
  const completionPercentage = Math.round((completedTasks / day.tasks.length) * 100);
  
  return (
    <Card className="border-3 border-black shadow-neo-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-[#5B86E5]" />
          Day {day.day}: {day.title}
          <div className="ml-auto text-sm font-normal">
            {completedTasks}/{day.tasks.length} tasks completed
          </div>
        </CardTitle>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {day.tasks.map((task, taskIndex) => (
            <li key={taskIndex} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              <Checkbox 
                id={`task-${dayIndex}-${taskIndex}`}
                checked={task.completed}
                onCheckedChange={() => onTaskComplete(taskIndex)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor={`task-${dayIndex}-${taskIndex}`}
                    className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.name}
                  </label>
                  <span className="text-sm text-muted-foreground">{task.duration}</span>
                </div>
                <p className={`text-sm mt-1 ${task.completed ? 'text-muted-foreground' : ''}`}>
                  {task.details}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DayPlanCard;
