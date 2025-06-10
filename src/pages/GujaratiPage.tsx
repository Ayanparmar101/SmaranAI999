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

const GujaratiPage = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const ageGroups = [
    {
      grade: '1-2',
      title: 'પ્રારંભિક શીખનારા',
      color: 'bg-kid-green'
    }, 
    {
      grade: '3-4',
      title: 'કૌશલ્ય નિર્માણ',
      color: 'bg-kid-blue'
    }, 
    {
      grade: '5-6',
      title: 'આત્મવિશ્વાસ વધારવો',
      color: 'bg-kid-purple'
    }, 
    {
      grade: '7-8',
      title: 'ઉન્નત ગુજરાતી',
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
                <span className="block">ગુજરાતી શીખો</span>
                <span className="gradient-text-animated-slow">
                  મજા સાથે!
                </span>
              </h1>
              <p className="text-xl mb-8 text-muted-foreground">
                ધોરણ 1-8 ના વિદ્યાર્થીઓ માટે ઇન્ટરેક્ટિવ પાઠો, વાર્તાઓ અને AI શિક્ષકો. ગુજરાતી ભાષાના કૌશલ્યમાં નિપુણતા મેળવો.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <DoodleButton 
                  color="blue" 
                  size="lg" 
                  onClick={handleNavigation("/gujarati/chatbot")}
                >
                  શરૂ કરો
                </DoodleButton>
                <DoodleButton 
                  color="purple" 
                  size="lg" 
                  variant="outline" 
                  onClick={handleNavigation("/gujarati/study-planner")}
                >
                  પાઠો જુઓ
                </DoodleButton>
              </div>
            </div>
            <div className="md:w-1/2 relative flex justify-center">
              <div className="relative w-3/4 md:w-full max-w-md">
                <img
                  alt="Gujarati learning illustration"
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
          <h2 className="section-title">મજાના સાધનો સાથે શીખો</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <DoodleCard 
              title="ગુજરાતી ચેટબોટ" 
              description="AI સહાયથી ગુજરાતી ભાષાની વિભાવનાઓનું અન્વેષણ કરો અને પ્રશ્નો પૂછો." 
              icon={<MessageSquare className="w-8 h-8" />} 
              color="purple" 
              to="/gujarati/chatbot" 
              onClick={handleNavigation("/gujarati/chatbot")}
            />
            
            <DoodleCard 
              title="અભ્યાસ આયોજક" 
              description="તમારા ગુજરાતી પ્રકરણો માટે AI-સંચાલિત અભ્યાસ યોજના બનાવો." 
              icon={<CalendarDays className="w-8 h-8" />} 
              color="pink" 
              to="/gujarati/study-planner" 
              onClick={handleNavigation("/gujarati/study-planner")}
            />
            
            <DoodleCard 
              title="વોઇસ બોટ" 
              description="એક AI શિક્ષક સાથે વાત કરો જે તમારો અવાજ સાંભળે અને જવાબ આપે." 
              icon={<Bot className="w-8 h-8" />} 
              color="blue" 
              to="/voice-bot" 
              onClick={handleNavigation("/voice-bot")}
            />

            <DoodleCard 
              title="વાર્તા ચિત્રો" 
              description="તમારી ગુજરાતી વાર્તાઓને દર્શાવવા માટે સુંદર ચિત્રો બનાવો." 
              icon={<Image className="w-8 h-8" />} 
              color="yellow" 
              to="/story-images" 
              onClick={handleNavigation("/story-images")}
            />
            
            <DoodleCard 
              title="પોમોડોરો ટાઇમર" 
              description="પોમોડોરો ઉત્પાદકતા તકનીક સાથે ધ્યાન વધારો." 
              icon={<Timer className="w-8 h-8" />} 
              color="orange" 
              to="/pomodoro" 
              onClick={handleNavigation("/pomodoro")}
            />

            <DoodleCard 
              title="શિક્ષક સાધનો" 
              description="ગુજરાતી શિક્ષણ અને સામગ્રી નિર્માણમાં મદદ માટેના સાધનો." 
              icon={<BookOpen className="w-8 h-8" />} 
              color="green" 
              to="/gujarati/teacher" 
              onClick={handleNavigation("/gujarati/teacher")}
            />

            <DoodleCard 
              title="ફ્લેશકાર્ડ જનરેટર" 
              description="PDF નોટ્સ અપલોડ કરો અને ગુજરાતી અભ્યાસ માટે AI-સંચાલિત ફ્લેશકાર્ડ બનાવો." 
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
          <h2 className="section-title">બધા વય જૂથો માટે</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {ageGroups.map((group, index) => (
              <div key={index} className="card-doodle transition-all duration-300 hover:scale-105">
                <div className={`${group.color} text-white text-sm font-medium px-3 py-1 rounded-full w-fit mb-4`}>
                  ધોરણ {group.grade}
                </div>
                <h3 className="text-xl font-bold mb-3">{group.title}</h3>
                <p className="text-gray-600">
                  આ વય જૂથની શીખવાની જરૂરિયાતો માટે ખાસ રીતે રચાયેલા પાઠો અને પ્રવૃત્તિઓ.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-0 py-[40px] bg-gradient-to-r from-kid-blue/10 to-kid-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">શીખવા શરૂ કરવા તૈયાર છો?</h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            બધા સ્તરના વિદ્યાર્થીઓ માટે રચાયેલા અમારા ઇન્ટરેક્ટિવ અને મજાના સાધનો સાથે તમારી ગુજરાતી શીખવાની યાત્રા શરૂ કરો.
          </p>
          <DoodleButton 
            color="purple" 
            size="lg" 
            onClick={handleNavigation("/gujarati/chatbot")}
          >
            હવે શરૂ કરો
          </DoodleButton>
        </div>
      </section>
    </main>
  );
};

export default GujaratiPage;
