
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { NeoButton } from "@/components/NeoButton";
import { Play, Pause, Timer, Clock, Bell, Coffee, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CircularTimer from "./CircularTimer";
import { usePomodoro } from "@/contexts/PomodoroContext";

const SHORT_BREAK_DURATION = 5; // 5 minutes short break
const LONG_BREAK_DURATION = 15; // 15 minutes long break

const PomodoroTimer = () => {
  const {
    duration,
    timeLeft,
    status,
    sessionType,
    sessionCount,
    isRunning,
    isBreak,
    toggleTimer,
    resetTimer,
    setDuration,
  } = usePomodoro();

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const getSessionTypeInfo = () => {
    switch (sessionType) {
      case 'focus':
        return {
          icon: <Clock className="text-green-500" />,
          label: 'Focus Session',
          description: 'Time to concentrate and get work done!',
          totalTime: duration * 60
        };
      case 'shortBreak':
        return {
          icon: <Coffee className="text-blue-500" />,
          label: 'Short Break',
          description: 'Take a quick break and recharge.',
          totalTime: SHORT_BREAK_DURATION * 60
        };
      case 'longBreak':
        return {
          icon: <Bell className="text-purple-500" />,
          label: 'Long Break',
          description: 'Enjoy a longer break - you\'ve earned it!',
          totalTime: LONG_BREAK_DURATION * 60
        };
      default:
        return {
          icon: <Clock className="text-green-500" />,
          label: 'Focus Session',
          description: 'Time to concentrate and get work done!',
          totalTime: duration * 60
        };
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'stopped':
        return 'Start';
      case 'running':
        return 'Pause';
      case 'paused':
        return 'Resume';
      default:
        return 'Start';
    }
  };

  const sessionInfo = getSessionTypeInfo();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
          <p className="text-muted-foreground mb-4">
            Focus better with timed work sessions and breaks
          </p>

          {/* Session Progress */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant="outline" className="px-3 py-1">
              Session {sessionCount + 1}
            </Badge>
            <Badge variant={sessionType === 'focus' ? 'default' : 'secondary'} className="px-3 py-1">
              {sessionInfo.label}
            </Badge>
          </div>
        </div>
        
        <Card className="p-6 mb-8 bg-gradient-to-r from-[#4E9BF5]/10 to-[#76D394]/10 border-black border-3 shadow-neo">
          <div className="flex flex-col items-center">
            {/* Circular Timer */}
            <CircularTimer
              timeLeft={timeLeft}
              totalTime={sessionInfo.totalTime}
              isBreak={isBreak}
            />

            {/* Control Buttons */}
            <div className="flex gap-3 mb-6">
              <NeoButton
                onClick={toggleTimer}
                variant={status === 'running' ? "warning" : "success"}
                size="lg"
                icon={status === 'running' ? <Pause /> : <Play />}
              >
                {getButtonText()}
              </NeoButton>

              {status !== 'stopped' && (
                <NeoButton
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                  icon={<Square />}
                >
                  Stop
                </NeoButton>
              )}
            </div>

            {/* Session Info */}
            <div className="text-center">
              <div className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                {sessionInfo.icon}
                {sessionInfo.label}
              </div>
              <p className="text-sm text-muted-foreground">
                {sessionInfo.description}
              </p>
              {status === 'paused' && (
                <Badge variant="secondary" className="mt-2">
                  Timer Paused
                </Badge>
              )}
            </div>
          </div>
        </Card>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Timer size={20} /> Session Duration
          </h2>
          
          <div className="mb-4">
            <Slider
              defaultValue={[25]}
              min={5}
              max={120}
              step={5}
              value={[duration]}
              onValueChange={handleDurationChange}
              disabled={isRunning}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5m</span>
              <span>{duration} minutes</span>
              <span>2h</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4 space-y-2">
            <p>
              <strong>How it works:</strong> Work for {duration} minutes, followed by breaks.
            </p>
            <ul className="text-left space-y-1">
              <li>• Short breaks: {SHORT_BREAK_DURATION} minutes (after each session)</li>
              <li>• Long breaks: {LONG_BREAK_DURATION} minutes (every 4 sessions)</li>
              <li>• Timer automatically switches between work and break modes</li>
              <li>• Progress is saved even if you refresh the page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
