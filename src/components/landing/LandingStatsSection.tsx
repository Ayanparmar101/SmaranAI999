import { TrendingUp, Users, BookOpen, Clock, Award, Zap } from 'lucide-react';

const LandingStatsSection = () => {
  const stats = [
    {
      number: "100+",
      label: "Active Students",
      description: "Learning daily across the Gujarat",
      icon: <Users className="w-8 h-8" />,
      color: "text-kid-blue",
      bgColor: "bg-kid-blue/10"
    },
    {
      number: "95%",
      label: "Improvement Rate",
      description: "Students see grade improvements",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "text-kid-green",
      bgColor: "bg-kid-green/10"
    },
    {
      number: "2K+",
      label: "Flashcards Created",
      description: "AI-generated learning content",
      icon: <BookOpen className="w-8 h-8" />,
      color: "text-kid-purple",
      bgColor: "bg-kid-purple/10"
    },
    {
      number: "1k+",
      label: "Study Hours",
      description: "Tracked learning time",
      icon: <Clock className="w-8 h-8" />,
      color: "text-kid-orange",
      bgColor: "bg-kid-orange/10"
    },
    {
      number: "20+",
      label: "Learning Tools",
      description: "Comprehensive feature set",
      icon: <Zap className="w-8 h-8" />,
      color: "text-kid-red",
      bgColor: "bg-kid-red/10"
    },
    {
      number: "98%",
      label: "User Satisfaction",
      description: "Students love our platform",
      icon: <Award className="w-8 h-8" />,
      color: "text-kid-yellow",
      bgColor: "bg-kid-yellow/10"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-kid-green/10 text-kid-green rounded-full text-sm font-medium mb-4">
            📊 Proven Impact & Results
          </div>
          <h2 className="section-title">Numbers That Speak Success</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our platform delivers measurable results that transform learning outcomes. 
            See how students worldwide are achieving their educational goals with Smaran.ai.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="card-doodle text-center group hover:scale-105 transition-all duration-300">
              <div className={`${stat.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {stat.number}
              </div>
              <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingStatsSection;
