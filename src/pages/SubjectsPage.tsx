import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookText, Atom, GraduationCap, Globe, Flag } from 'lucide-react';
import DoodleCard from '@/components/DoodleCard';

const SubjectsPage = () => {
  const navigate = useNavigate();
  
  const handleSubjectClick = (subjectName: string) => {
    console.log(`Navigating for subject: ${subjectName}`);
    switch(subjectName) {
      case 'English':
        navigate('/english');
        break;
      case 'Mathematics':
        navigate('/mathematics');
        break;
      case 'Hindi':
        navigate('/hindi'); 
        break;
      case 'Gujarati':
        // Changed: Navigate to the new Gujarati landing page
        navigate('/gujarati'); 
        break;
      case 'Science':
        navigate('/science');
        break;
      case 'Social Science':
        navigate('/social-science');
        break;
      default:
        console.log(`No specific navigation defined for ${subjectName}`);
    }
  };

  const subjects = [
    { name: 'Mathematics', icon: <GraduationCap className="w-8 h-8" />, color: 'blue', description: 'Explore numbers...' },
    { name: 'English', icon: <BookText className="w-8 h-8" />, color: 'green', description: 'Master language skills...' },
    { name: 'Science', icon: <Atom className="w-8 h-8" />, color: 'purple', description: 'Discover the natural world...' },
    { name: 'Social Science', icon: <Globe className="w-8 h-8" />, color: 'yellow', description: 'Learn about history...' },
    { name: 'Hindi', icon: <Flag className="w-8 h-8" />, color: 'orange', description: 'Develop Hindi language skills...' },
    { name: 'Gujarati', icon: <BookOpen className="w-8 h-8" />, color: 'red', description: 'Learn Gujarati...' }
  ];

  return (
    <section className="relative py-8 sm:py-12 md:py-20 overflow-hidden bg-background text-foreground">
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-center leading-tight">
          <span className="gradient-text-animated-slow">
            Choose Your Subject
          </span>
        </h1>
        <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed px-2">
          Select a subject to start learning with interactive lessons, exercises, and AI-powered tutoring
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 justify-items-center max-w-6xl mx-auto">
          {subjects.map((subject, index) => (
            <DoodleCard
              key={index}
              title={subject.name}
              description={subject.description}
              icon={subject.icon}
              color={subject.color as 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'pink'}
              onClick={() => handleSubjectClick(subject.name)}
              className="hover:scale-105 transition-transform duration-300 cursor-pointer min-h-[140px] sm:h-48 flex flex-col justify-center w-full max-w-sm"
            />
          ))}
        </div>
      </div>
      
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-20 -z-10">
        <div className="text-kid-blue">
          <GraduationCap size={64} />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-20 -z-10">
        <div className="text-kid-green">
          <BookText size={64} />
        </div>
      </div>
    </section>
  );
};

export default SubjectsPage;
