import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare,
    Atom,
    Bot,
    CalendarDays,
    Timer,
    Image,
    Microscope,
    FlaskConical,
    Brain,
    BookOpen
} from 'lucide-react';
import DoodleCard from '@/components/DoodleCard';
import DoodleDecoration from '@/components/DoodleDecoration';
import DoodleButton from '@/components/DoodleButton';

const SciencePage = () => {
  const navigate = useNavigate();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Ensure navigation is ready after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = useCallback((path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isNavigationReady) {
      console.warn('Navigation not ready yet, retrying...');
      setTimeout(() => navigate(path), 50);
      return;
    }

    console.log('Navigating to:', path);
    navigate(path);
  }, [navigate, isNavigationReady]);

  const ageGroups = [
    {
      grade: '1-2',
      title: 'Early Explorers',
      color: 'bg-kid-green'
    }, 
    {
      grade: '3-4',
      title: 'Young Scientists',
      color: 'bg-kid-blue'
    }, 
    {
      grade: '5-6',
      title: 'Science Discoverers',
      color: 'bg-kid-purple'
    }, 
    {
      grade: '7-8',
      title: 'Advanced Science',
      color: 'bg-kid-red'
    }
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden bg-background text-foreground">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="block">Learn Science</span>
                <span className="gradient-text-animated-slow">
                  The Fun Way!
                </span>
              </h1>
              <p className="text-xl mb-8 text-muted-foreground">
                Interactive lessons, experiments, and AI tutors to help students in grades 1-8 master Science.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <DoodleButton
                  color="blue"
                  size="lg"
                  onClick={handleNavigation("/science/chatbot")}
                  disabled={!isNavigationReady}
                >
                  Get Started
                </DoodleButton>
                <DoodleButton
                  color="purple"
                  size="lg"
                  variant="outline"
                  onClick={handleNavigation("/science/study-planner")}
                  disabled={!isNavigationReady}
                >
                  Explore Lessons
                </DoodleButton>
              </div>
            </div>
            <div className="md:w-1/2 relative flex justify-center">
              <div className="relative w-3/4 md:w-full max-w-md">
                <img
                  alt="Science learning illustration"
                  src="/assets/ScienceIMG.png"
                  className="rounded-3xl shadow-lg object-contain aspect-square"
                />
                <div className="absolute -top-6 -right-6">
                  <DoodleDecoration type="star" color="yellow" size="lg" />
                </div>
                <div className="absolute -bottom-6 -left-6">
                  <DoodleDecoration type="heart" color="red" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-20 left-10 opacity-10 dark:opacity-20 -z-10">
          <DoodleDecoration type="cloud" color="blue" size="lg" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-20 -z-10">
          <DoodleDecoration type="circle" color="green" size="lg" />
        </div>      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Learn With Fun Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <DoodleCard
              title="Science Learner"
              description="Interactive science lessons with quizzes for grades 1-8."
              icon={<BookOpen className="w-8 h-8" />}
              color="purple"
              to="/science-learner"
              onClick={handleNavigation("/science-learner")}
            />
            <DoodleCard
              title="Science Chatbot"
              description="Ask questions and explore scientific concepts with AI assistance."
              icon={<MessageSquare className="w-8 h-8" />}
              color="blue"
              to="/science/chatbot"
              onClick={handleNavigation("/science/chatbot")}
            />
              <DoodleCard 
              title="Study Planner" 
              description="Generate AI-powered study plans for your science chapters." 
              icon={<CalendarDays className="w-8 h-8" />} 
              color="pink" 
              to="/science/study-planner" 
              onClick={handleNavigation("/science/study-planner")}
            />
            
            <DoodleCard 
              title="Voice Bot" 
              description="Talk with an AI tutor that listens and responds to your voice." 
              icon={<Bot className="w-8 h-8" />} 
              color="blue" 
              to="/voice-bot" 
              onClick={handleNavigation("/voice-bot")}
            />

            <DoodleCard 
              title="Story Images" 
              description="Create beautiful images to illustrate your science stories." 
              icon={<Image className="w-8 h-8" />} 
              color="yellow" 
              to="/story-images" 
              onClick={handleNavigation("/story-images")}
            />
              <DoodleCard 
              title="Pomodoro Timer" 
              description="Boost focus with the Pomodoro productivity technique." 
              icon={<Timer className="w-8 h-8" />} 
              color="orange" 
              to="/pomodoro" 
              onClick={handleNavigation("/pomodoro")}
            />            <DoodleCard 
              title="Teacher Tools"
              description="NCERT Class 8 Science chapters with interactive teaching support." 
              icon={<FlaskConical className="w-8 h-8" />} 
              color="blue" 
              to="/science/teacher" 
              onClick={handleNavigation("/science/teacher")}
            />

            <DoodleCard 
              title="Flashcard Generator" 
              description="Upload PDF notes and generate AI-powered flashcards for science study." 
              icon={<Brain className="w-8 h-8" />} 
              color="green" 
              to="/flashcards" 
              onClick={handleNavigation("/flashcards")}
            />
          </div></div>
      </section>

      {/* Age Groups Section */}
      <section className="px-0 py-[40px]">
        <div className="container mx-auto px-4">
          <h2 className="section-title">For All Age Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {ageGroups.map((group, index) => (
              <div key={index} className="card-doodle transition-all duration-300 hover:scale-105">
                <div className={`${group.color} text-white text-sm font-medium px-3 py-1 rounded-full w-fit mb-4`}>
                  Grades {group.grade}
                </div>
                <h3 className="text-xl font-bold mb-3">{group.title}</h3>
                <p className="text-gray-600">
                  Lessons and activities specifically designed for this age group's learning needs.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-0 py-[40px] bg-gradient-to-r from-kid-blue/10 to-kid-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Begin your Science learning journey with our interactive and fun tools designed for students of all levels.
          </p>
          <DoodleButton
            color="purple"
            size="lg"
            onClick={handleNavigation("/science/chatbot")}
            disabled={!isNavigationReady}
          >
            Get Started Now
          </DoodleButton>
        </div>
      </section>
    </main>
  );
};

export default SciencePage;
