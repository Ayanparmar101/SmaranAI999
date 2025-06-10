import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthButton from './AuthButton';
import { ThemeToggle } from './ThemeToggle';
import PomodoroIndicator from './PomodoroIndicator';

import {
  Menu,
  Home,
  BookText,
  Image,
  Bot,
  GraduationCap,
  CalendarDays,
  Timer,
  BookOpen,
  UserRound,
  History,
  Brain,
  Zap
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet";

const NavBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault(); 
    navigate(path);
  };
  
  const sidebarBg = "bg-background"; 
  const sidebarText = "text-foreground"; 
  const sidebarBorder = "border-border"; 
  const sidebarHeaderBorder = "border-border/40"; 
  const menuButtonText = "text-foreground"; 
  const menuButtonFocusRing = "focus:ring-ring"; 
  const headerBg = "bg-background"; 
  const headerBorder = "border-border/40"; 

  return (
    <header className={`sticky top-0 w-full py-3 px-3 md:py-4 md:px-8 ${headerBg} border-b ${headerBorder} z-50 shadow-md`}>
      <div className="container mx-auto flex justify-between items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button className={`${menuButtonText} hover:text-primary transition-colors focus:outline-none focus:ring-2 ${menuButtonFocusRing} rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center`} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className={`w-[280px] sm:w-[300px] ${sidebarBg} ${sidebarText} p-0 border-l ${sidebarBorder} flex flex-col max-h-screen`}
          >
            <SheetHeader className={`p-4 border-b ${sidebarHeaderBorder} flex-shrink-0`}>
              <SheetTitle asChild>
                <Link
                  to="/"
                  onClick={(e) => { e.preventDefault(); navigate('/'); }}
                  className="text-3xl md:text-4xl font-bold flex items-center gap-1"
                 >
                  <span className="gradient-text-animated">
                    Smaran.ai
                  </span>
                </Link>
              </SheetTitle>
              <SheetDescription>
                Navigate through Smaran.ai's learning tools and features.
              </SheetDescription>
            </SheetHeader>
            
            <nav className="flex flex-col flex-1 min-h-0 relative">
              {/* Sidebar Links - The header is now separate */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-8 px-3 sm:pt-6 sm:pb-10 sm:px-4 sidebar-scroll">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                  <button
                    onClick={handleNavigation("/")}
                    className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-primary/50 min-h-[60px] sm:h-24"
                  >
                    <Home size={20} className="sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm font-medium text-center">Home</span>
                  </button>
                  
                   {user &&
                    <button
                      onClick={handleNavigation("/subjects")}
                      className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-purple/10 dark:hover:bg-kid-purple/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-purple/50 min-h-[60px] sm:h-24"
                    >
                      <GraduationCap size={20} className="sm:w-6 sm:h-6 text-kid-purple" />
                      <span className="text-xs sm:text-sm font-medium text-center text-foreground">Subjects</span>
                    </button>
                   }
                  <button
                    onClick={handleNavigation("/grammar")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-green/10 dark:hover:bg-kid-green/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-green/50 min-h-[60px] sm:h-24"
                  >
                    <BookText size={20} className="sm:w-6 sm:h-6 text-kid-green" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Grammar</span>
                  </button>
                  <button
                     onClick={handleNavigation("/story-images")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-yellow/10 dark:hover:bg-kid-yellow/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-yellow/50 min-h-[60px] sm:h-24"
                  >
                    <Image size={20} className="sm:w-6 sm:h-6 text-kid-yellow" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Story Images</span>
                  </button>
                  <button
                     onClick={handleNavigation("/voice-bot")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-purple/10 dark:hover:bg-kid-purple/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-purple/50 min-h-[60px] sm:h-24"
                  >
                    <Bot size={20} className="sm:w-6 sm:h-6 text-kid-purple" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Voice Bot</span>
                  </button>
                  <button
                     onClick={handleNavigation("/socratic-tutor")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-blue/10 dark:hover:bg-kid-blue/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-blue/50 min-h-[60px] sm:h-24"
                  >
                    <GraduationCap size={20} className="sm:w-6 sm:h-6 text-kid-blue" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Socratic Tutor</span>
                  </button>
                  <button
                     onClick={handleNavigation("/study-planner")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-pink/10 dark:hover:bg-kid-pink/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-pink/50 min-h-[60px] sm:h-24"
                  >
                    <CalendarDays size={20} className="sm:w-6 sm:h-6 text-kid-pink" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Study Planner</span>
                  </button>
                  <button
                     onClick={handleNavigation("/pomodoro")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-orange/10 dark:hover:bg-kid-orange/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-orange/50 min-h-[60px] sm:h-24"
                  >
                    <Timer size={20} className="sm:w-6 sm:h-6 text-kid-orange" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Pomodoro Timer</span>
                  </button>
                  <button
                     onClick={handleNavigation("/flashcards")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-purple/10 dark:hover:bg-kid-purple/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-purple/50 min-h-[60px] sm:h-24"
                  >
                    <Brain size={20} className="sm:w-6 sm:h-6 text-kid-purple" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Flashcards</span>
                  </button>

                  {user &&
                    <button
                       onClick={handleNavigation("/teacher")}
                       className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-green/10 dark:hover:bg-kid-green/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-green/50 min-h-[60px] sm:h-24"
                    >
                      <BookOpen size={20} className="sm:w-6 sm:h-6 text-kid-green" />
                      <span className="text-xs sm:text-sm font-medium text-center text-foreground">Teacher Tools</span>
                    </button>
                   }
                  <button
                     onClick={handleNavigation("/profile")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-blue/10 dark:hover:bg-kid-blue/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-blue/50 min-h-[60px] sm:h-24"
                  >
                    <UserRound size={20} className="sm:w-6 sm:h-6 text-kid-blue" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">Profile</span>
                  </button>
                  <button
                     onClick={handleNavigation("/firebase-history")}
                     className="card-doodle flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-transparent hover:bg-kid-purple/10 dark:hover:bg-kid-purple/30 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-dashed border-kid-purple/50 min-h-[60px] sm:h-24"
                  >
                    <History size={20} className="sm:w-6 sm:h-6 text-kid-purple" />
                    <span className="text-xs sm:text-sm font-medium text-center text-foreground">History</span>
                  </button>
                </div>
              </div>
              {/* Scroll indicator gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 flex justify-center md:justify-start">
          <Link to="/subjects" className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-1 px-2 sm:px-4 md:px-[19px]">
             <span className="gradient-text-animated">
              Smaran.ai
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <PomodoroIndicator />
          </div>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
};

export default NavBar;
