
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Optimized imports - only import what we need
import {
  BookOpen,
  Image,
  MessageCircle,
  HelpCircle,
  CalendarDays,
  Timer,
  GraduationCap,
  Bot,
  Brain,
  Zap
} from 'lucide-react';
import DoodleCard from '@/components/DoodleCard';
import DoodleDecoration from '@/components/DoodleDecoration';

const FeaturesSection = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    // Ensuring theme compatibility for the section background
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Learn With Fun Tools</h2>
        {/* Responsive grid that stacks on mobile, 2 columns on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 justify-items-center">
          <DoodleCard 
            title="English Grammar" 
            description="Learn grammar rules with interactive lessons and fun exercises." 
            icon={<BookOpen className="w-8 h-8" />} 
            color="green" 
            to="/grammar" 
            onClick={handleNavigation("/grammar")}
          />
          
          <DoodleCard 
            title="Story Image Generator" 
            description="Create beautiful images to illustrate your stories and writing." 
            icon={<Image className="w-8 h-8" />} 
            color="yellow" 
            to="/story-images" 
            onClick={handleNavigation("/story-images")}
          />
          
          <DoodleCard 
            title="Voice Bot" 
            description="Talk with an AI tutor that listens and responds to your voice." 
            icon={<Bot className="w-8 h-8" />} // Changed icon
            color="purple" 
            to="/voice-bot" 
            onClick={handleNavigation("/voice-bot")}
          />
          
          <DoodleCard 
            title="Socratic Tutor" 
            description="Learn through guided questions that help you discover answers." 
            icon={<HelpCircle className="w-8 h-8" />} 
            color="orange" 
            to="/socratic-tutor" 
            onClick={handleNavigation("/socratic-tutor")}
          />

          {/* Added Study Planner */}
          <DoodleCard 
            title="Study Planner" 
            description="Generate AI-powered study plans for your chapters." 
            icon={<CalendarDays className="w-8 h-8" />} 
            color="pink" 
            to="/study-planner" 
            onClick={handleNavigation("/study-planner")}
          />

          {/* Added Pomodoro Timer */}
          <DoodleCard 
            title="Pomodoro Timer" 
            description="Boost focus with the Pomodoro productivity technique." 
            icon={<Timer className="w-8 h-8" />} 
            color="orange" // Reusing orange, consider another color if needed
            to="/pomodoro" 
            onClick={handleNavigation("/pomodoro")}
          />

          {/* Added Teacher Tools */}
          <DoodleCard 
            title="Teacher Tools" 
            description="Tools to assist with teaching and content creation." 
            icon={<GraduationCap className="w-8 h-8" />} // Using GraduationCap
            color="green" // Reusing green, consider another color if needed
            to="/teacher" 
            onClick={handleNavigation("/teacher")}
          />

          {/* Added Flashcard Generator */}
          <DoodleCard
            title="Flashcard Generator"
            description="Upload PDFs and generate AI-powered flashcards for studying."
            icon={<Brain className="w-8 h-8" />}
            color="purple"
            to="/flashcards"
            onClick={handleNavigation("/flashcards")}
          />



          {/* Removing the Coming Soon card */}
          {/* <div className="card-doodle border-kid-pink flex flex-col items-center justify-center bg-gradient-to-br from-white to-pink-100 p-6">
            <DoodleDecoration type="heart" color="pink" size="md" />
            <h3 className="text-xl font-bold mt-4 mb-2">Coming Soon</h3>
            <p className="text-gray-600 text-center">More exciting features are on the way!</p>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
