import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MessageSquare, 
    Bot,
    CalendarDays,
    Timer,
    Image,
    BookOpen,
    Brain
} from 'lucide-react';
import DoodleCard from '@/components/DoodleCard';
import DoodleDecoration from '@/components/DoodleDecoration';
import DoodleButton from '@/components/DoodleButton';

const HindiPage = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const ageGroups = [
    {
      grade: '1-2',
      title: 'प्रारंभिक शिक्षार्थी',
      color: 'bg-kid-green'
    }, 
    {
      grade: '3-4',
      title: 'कौशल निर्माण',
      color: 'bg-kid-blue'
    }, 
    {
      grade: '5-6',
      title: 'आत्मविश्वास बढ़ाना',
      color: 'bg-kid-purple'
    }, 
    {
      grade: '7-8',
      title: 'उन्नत हिंदी',
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
                <span className="block">हिंदी सीखें</span>
                <span className="gradient-text-animated-slow">
                  मज़े के साथ!
                </span>
              </h1>
              <p className="text-xl mb-8 text-muted-foreground">
                कक्षा 1-8 के छात्रों के लिए इंटरैक्टिव पाठ, कहानियां और AI शिक्षक। हिंदी भाषा कौशल में महारत हासिल करें।
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <DoodleButton 
                  color="blue" 
                  size="lg" 
                  onClick={handleNavigation("/hindi/chatbot")}
                >
                  शुरू करें
                </DoodleButton>
                <DoodleButton 
                  color="purple" 
                  size="lg" 
                  variant="outline" 
                  onClick={handleNavigation("/hindi/study-planner")}
                >
                  पाठ देखें
                </DoodleButton>
              </div>
            </div>
            <div className="md:w-1/2 relative flex justify-center">
              <div className="relative w-3/4 md:w-full max-w-md">
                <img
                  alt="Hindi learning illustration"
                  src="/assets/SocialScienceIMG.png"
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="section-title">मज़ेदार उपकरणों के साथ सीखें</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <DoodleCard
              title="हिंदी व्याकरण"
              description="इंटरैक्टिव पाठों और मज़ेदार अभ्यासों के साथ व्याकरण के नियम सीखें।"
              icon={<BookOpen className="w-8 h-8" />}
              color="red"
              to="/hindi/grammar"
              onClick={handleNavigation("/hindi/grammar")}
            />

            <DoodleCard
              title="हिंदी चैटबॉट"
              description="AI सहायता के साथ हिंदी भाषा की अवधारणाओं का अन्वेषण करें और प्रश्न पूछें।"
              icon={<MessageSquare className="w-8 h-8" />}
              color="purple"
              to="/hindi/chatbot"
              onClick={handleNavigation("/hindi/chatbot")}
            />
            
            <DoodleCard 
              title="अध्ययन योजनाकार" 
              description="अपने हिंदी अध्यायों के लिए AI-संचालित अध्ययन योजना बनाएं।" 
              icon={<CalendarDays className="w-8 h-8" />} 
              color="pink" 
              to="/hindi/study-planner" 
              onClick={handleNavigation("/hindi/study-planner")}
            />
            
            <DoodleCard 
              title="वॉयस बॉट" 
              description="एक AI शिक्षक से बात करें जो आपकी आवाज़ सुनता और जवाब देता है।" 
              icon={<Bot className="w-8 h-8" />} 
              color="blue" 
              to="/voice-bot" 
              onClick={handleNavigation("/voice-bot")}
            />

            <DoodleCard 
              title="कहानी चित्र" 
              description="अपनी हिंदी कहानियों को चित्रित करने के लिए सुंदर चित्र बनाएं।" 
              icon={<Image className="w-8 h-8" />} 
              color="yellow" 
              to="/story-images" 
              onClick={handleNavigation("/story-images")}
            />
            
            <DoodleCard 
              title="पोमोडोरो टाइमर" 
              description="पोमोडोरो उत्पादकता तकनीक के साथ ध्यान बढ़ाएं।" 
              icon={<Timer className="w-8 h-8" />} 
              color="orange" 
              to="/pomodoro" 
              onClick={handleNavigation("/pomodoro")}
            />

            <DoodleCard 
              title="शिक्षक उपकरण" 
              description="हिंदी शिक्षण और सामग्री निर्माण में सहायता के लिए उपकरण।" 
              icon={<BookOpen className="w-8 h-8" />} 
              color="green" 
              to="/hindi/teacher" 
              onClick={handleNavigation("/hindi/teacher")}
            />

            <DoodleCard 
              title="फ्लैशकार्ड जेनरेटर" 
              description="PDF नोट्स अपलोड करें और हिंदी अध्ययन के लिए AI-संचालित फ्लैशकार्ड बनाएं।" 
              icon={<Brain className="w-8 h-8" />} 
              color="purple" 
              to="/flashcards" 
              onClick={handleNavigation("/flashcards")}
            />
          </div>
        </div>
      </section>

      {/* Age Groups Section */}
      <section className="px-0 py-[40px]">
        <div className="container mx-auto px-4">
          <h2 className="section-title">सभी आयु समूहों के लिए</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {ageGroups.map((group, index) => (
              <div key={index} className="card-doodle transition-all duration-300 hover:scale-105">
                <div className={`${group.color} text-white text-sm font-medium px-3 py-1 rounded-full w-fit mb-4`}>
                  कक्षा {group.grade}
                </div>
                <h3 className="text-xl font-bold mb-3">{group.title}</h3>
                <p className="text-gray-600">
                  इस आयु समूह की सीखने की आवश्यकताओं के लिए विशेष रूप से डिज़ाइन किए गए पाठ और गतिविधियां।
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-0 py-[40px] bg-gradient-to-r from-kid-blue/10 to-kid-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">सीखना शुरू करने के लिए तैयार हैं?</h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            सभी स्तरों के छात्रों के लिए डिज़ाइन किए गए हमारे इंटरैक्टिव और मज़ेदार उपकरणों के साथ अपनी हिंदी सीखने की यात्रा शुरू करें।
          </p>
          <DoodleButton 
            color="purple" 
            size="lg" 
            onClick={handleNavigation("/hindi/chatbot")}
          >
            अभी शुरू करें
          </DoodleButton>
        </div>
      </section>
    </main>
  );
};

export default HindiPage;
