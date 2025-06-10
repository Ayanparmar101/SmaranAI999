
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, 
  Sigma, 
  Pi, 
  SquareDot, 
  BrainCircuit, 
  PenTool, 
  Bot,               // <-- Added Icon
  CalendarDays,      // <-- Added Icon
  Timer,             // <-- Added Icon
  BookOpen,           // <-- Added Icon
  GraduationCap,    // <-- Added Icon for Teacher Tools
  CreditCard        // <-- Added Icon for Flashcards
} from 'lucide-react';
import DoodleCard from '@/components/DoodleCard';
import DoodleDecoration from '@/components/DoodleDecoration';
import MathHeroSection from '@/components/math/MathHeroSection';

const MathematicsPage = () => {
  const navigate = useNavigate();
  
  const handleCardClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (path) {
      navigate(path);
    }
  };

  // Subject-specific tools
  const mathTools = [
    { name: 'Math Learner', icon: <BookOpen className="w-8 h-8" />, color: 'blue', description: 'Interactive math lessons with quizzes for grades 1-8', path: '/math-learner' },
    { name: 'Basic Arithmetic', icon: <Calculator className="w-8 h-8" />, color: 'green', description: 'Master addition, subtraction, multiplication, and division', path: '/math/arithmetic' },
    { name: 'Algebra', icon: <SquareDot className="w-8 h-8" />, color: 'purple', description: 'Learn equations, variables, and algebraic expressions', path: '/math/algebra' },
    { name: 'Geometry', icon: <PenTool className="w-8 h-8" />, color: 'yellow', description: 'Explore shapes, angles, and spatial relationships', path: '/math/geometry' },
    { name: 'Calculus', icon: <Sigma className="w-8 h-8" />, color: 'orange', description: 'Understand derivatives, integrals, and limits', path: '/math/calculus' },
    { name: 'Statistics', icon: <Pi className="w-8 h-8" />, color: 'red', description: 'Work with data, probability, and statistical analysis', path: '/math/statistics' },
    { name: 'Problem Solving', icon: <BrainCircuit className="w-8 h-8" />, color: 'pink', description: 'Develop critical thinking and mathematical reasoning skills', path: '/math/problem-solving' }
  ];

  // General tools
  const generalTools = [
    { name: 'Voice Bot', icon: <Bot className="w-8 h-8" />, color: 'purple', description: 'Practice conversation skills with an AI tutor.', path: '/voice-bot' },
    { name: 'Study Planner', icon: <CalendarDays className="w-8 h-8" />, color: 'pink', description: 'Generate AI-powered study plans for your chapters.', path: '/study-planner' },
    { name: 'Pomodoro Timer', icon: <Timer className="w-8 h-8" />, color: 'orange', description: 'Boost focus with the Pomodoro productivity technique.', path: '/pomodoro' },
    { name: 'Flashcard Generator', icon: <CreditCard className="w-8 h-8" />, color: 'blue', description: 'Create and study flashcards from PDFs and notes.', path: '/flashcards' },
    { name: 'Teacher Tools', icon: <GraduationCap className="w-8 h-8" />, color: 'teal', description: 'Mathematics teaching tools and chapter content.', path: '/mathematics/teacher' }, // Updated path and description
  ];

  return (
    <main>
      <MathHeroSection />

      {/* Section for Math Tools */}
      <section id="math-tools-section" className="py-16 bg-background text-foreground relative">
        <div className="container mx-auto px-4">
          <h2 className="section-title">
            Explore Math Tools
          </h2>
          <p className="text-xl mb-12 text-muted-foreground text-center max-w-3xl mx-auto">
            Select a topic to start practicing and learning with AI guidance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {mathTools.map((tool, index) => (
              <DoodleCard 
                key={`math-${index}`}
                title={tool.name} 
                description={tool.description} 
                icon={tool.icon} 
                color={tool.color as any} 
                onClick={handleCardClick(tool.path)}
              />
            ))}
          </div>
        </div>
        {/* Decorations for Math Tools */}
        <div className="absolute top-10 left-5 opacity-10 dark:opacity-20 -z-10">
           <DoodleDecoration type="star" color="green" size="lg" />
        </div>
        <div className="absolute bottom-10 right-5 opacity-10 dark:opacity-20 -z-10">
          <DoodleDecoration type="squiggle" color="yellow" size="lg" /> 
        </div>
      </section>

      {/* Added Section for General Tools */}
      <section id="general-tools-section" className="py-16 bg-muted/40 text-foreground relative">
        <div className="container mx-auto px-4">
          <h2 className="section-title">
            General Learning Tools
          </h2>
          <p className="text-xl mb-12 text-muted-foreground text-center max-w-3xl mx-auto">
            Explore other tools to enhance your learning experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-12"> {/* Adjusted grid to lg:grid-cols-5 */}
            {generalTools.map((tool, index) => (
              <DoodleCard 
                key={`general-${index}`}
                title={tool.name} 
                description={tool.description} 
                icon={tool.icon} 
                color={tool.color as any} 
                onClick={handleCardClick(tool.path)}
              />
            ))}
          </div>
        </div>
        {/* Optional: Add decorations for General Tools */}
      </section>
    </main>
  );
};

export default MathematicsPage;
