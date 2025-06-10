import React from 'react';
import DoodleCard from '@/components/DoodleCard';
import { 
  BookOpen, 
  Calendar, 
  Mic, 
  FileText, 
  Users, 
  HelpCircle, 
  Image, 
  Bot, 
  Clock, 
  Calculator,
  MessageSquare,
  Brain,
  Languages,
  Target,
  Zap,
  Award
} from 'lucide-react';

const LandingFeaturesSection = () => {
  const features = [
    {
      title: "Smart Flashcards",
      description: "AI-powered flashcard generation with spaced repetition and exam tracking for optimal learning retention.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "blue" as const,
      category: "Learning Tools"
    },
    {
      title: "Study Planner",
      description: "Personalized study schedules across multiple subjects with progress tracking and adaptive planning.",
      icon: <Calendar className="w-8 h-8" />,
      color: "green" as const,
      category: "Planning"
    },
    {
      title: "Voice Assistant",
      description: "Interactive voice-powered learning with speech recognition and natural conversation capabilities.",
      icon: <Mic className="w-8 h-8" />,
      color: "purple" as const,
      category: "AI Tools"
    },
    {
      title: "PDF Processing",
      description: "Advanced PDF text extraction, analysis, and question generation for comprehensive document learning.",
      icon: <FileText className="w-8 h-8" />,
      color: "orange" as const,
      category: "Document Tools"
    },
    {
      title: "Teacher Dashboard",
      description: "Comprehensive tools for educators including student progress tracking and assignment management.",
      icon: <Users className="w-8 h-8" />,
      color: "red" as const,
      category: "Education"
    },
    {
      title: "Socratic Tutor",
      description: "AI tutor that guides learning through thoughtful questions and discovery-based learning methods.",
      icon: <HelpCircle className="w-8 h-8" />,
      color: "yellow" as const,
      category: "AI Tools"
    },
    {
      title: "Story Images",
      description: "Creative image generation for storytelling and visual learning enhancement.",
      icon: <Image className="w-8 h-8" />,
      color: "pink" as const,
      category: "Creative Tools"
    },
    {
      title: "Voice Bot",
      description: "Advanced conversational AI for interactive learning sessions and practice conversations.",
      icon: <Bot className="w-8 h-8" />,
      color: "blue" as const,
      category: "AI Tools"
    },
    {
      title: "Pomodoro Timer",
      description: "Focus-enhancing study sessions with built-in break management and productivity tracking.",
      icon: <Clock className="w-8 h-8" />,
      color: "green" as const,
      category: "Productivity"
    },
    {
      title: "Mathematics Suite",
      description: "Complete math learning platform with problem solving, step-by-step solutions, and practice tests.",
      icon: <Calculator className="w-8 h-8" />,
      color: "purple" as const,
      category: "Subjects"
    },
    {
      title: "Real-time Messaging",
      description: "Collaborative learning through instant messaging and study group communication.",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "orange" as const,
      category: "Communication"
    },
    {
      title: "Grammar Assistant",
      description: "Interactive grammar lessons with real-time correction and improvement suggestions.",
      icon: <Languages className="w-8 h-8" />,
      color: "red" as const,
      category: "Language"
    }
  ];

  const categories = [
    { name: "AI Tools", color: "bg-kid-purple", count: features.filter(f => f.category === "AI Tools").length },
    { name: "Learning Tools", color: "bg-kid-blue", count: features.filter(f => f.category === "Learning Tools").length },
    { name: "Subjects", color: "bg-kid-green", count: features.filter(f => f.category === "Subjects").length },
    { name: "Education", color: "bg-kid-red", count: features.filter(f => f.category === "Education").length },
    { name: "Productivity", color: "bg-kid-yellow", count: features.filter(f => f.category === "Productivity").length },
    { name: "Communication", color: "bg-kid-orange", count: features.filter(f => f.category === "Communication").length }
  ];

  return (
    <section id="features-section" className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-kid-blue/10 text-kid-blue rounded-full text-sm font-medium mb-4">
            🎯 Complete Learning Ecosystem
          </div>
          <h2 className="section-title">Everything You Need to Excel</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform combines cutting-edge AI technology with proven educational methods 
            to create the ultimate learning experience for students and educators.
          </p>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((category, index) => (
            <div key={index} className="text-center">
              <div className={`${category.color} text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2`}>
                <span className="font-bold">{category.count}</span>
              </div>
              <p className="text-sm font-medium">{category.name}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <DoodleCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              className="h-full"
            >
              <div className="mt-4 pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  {feature.category}
                </span>
              </div>
            </DoodleCard>
          ))}
        </div>

        {/* Key Highlights */}
        <div className="bg-gradient-to-r from-kid-blue/5 to-kid-purple/5 rounded-3xl p-8 border-4 border-dashed border-kid-blue/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose Smaran.ai?</h3>
            <p className="text-muted-foreground">Built for the modern learner with cutting-edge technology</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-kid-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-kid-blue" />
              </div>
              <h4 className="font-bold mb-2">AI-Powered Intelligence</h4>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning algorithms adapt to your learning style and pace
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-kid-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-kid-green" />
              </div>
              <h4 className="font-bold mb-2">Personalized Learning</h4>
              <p className="text-sm text-muted-foreground">
                Customized study plans and content recommendations based on your progress
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-kid-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-kid-purple" />
              </div>
              <h4 className="font-bold mb-2">Proven Results</h4>
              <p className="text-sm text-muted-foreground">
                Track your progress with detailed analytics and achievement systems
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeaturesSection;
