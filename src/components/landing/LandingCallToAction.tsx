import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoodleButton from '@/components/DoodleButton';
import { ArrowRight, Sparkles, Target, Zap, BookOpen, Users, Award } from 'lucide-react';

const LandingCallToAction = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features-section');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const urgencyFeatures = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Get personalized tutoring that adapts to your pace"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Proven Results",
      description: "95% of students see grade improvements within 3 months"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Access",
      description: "Start learning immediately with 50+ tools and features"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-kid-blue/10 via-kid-purple/10 to-kid-red/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-kid-yellow/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-kid-green/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-kid-purple/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main CTA Content */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-kid-red/10 text-kid-red rounded-full text-sm font-medium mb-6">
            🎯 Limited Time: Free Access to All Premium Features
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="block text-foreground">Ready to Transform</span>
            <span className="gradient-text-animated-slow">
              Your Learning?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Join thousands of students who are already achieving their academic goals with our AI-powered platform. 
            Start your journey to academic excellence today – completely free!
          </p>

          {/* Urgency Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
            {urgencyFeatures.map((feature, index) => (
              <div key={index} className="bg-background/80 backdrop-blur rounded-2xl p-6 border-2 border-border shadow-lg">
                <div className="text-kid-blue mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <DoodleButton
              color="blue"
              size="lg"
              onClick={handleGetStarted}
              className="min-w-[250px] text-lg py-4"
              icon={<ArrowRight className="h-6 w-6" />}
            >
              Start Learning Free Now
            </DoodleButton>
            <DoodleButton
              color="purple"
              size="lg"
              variant="outline"
              onClick={handleLearnMore}
              className="min-w-[250px] text-lg py-4"
              icon={<BookOpen className="h-6 w-6" />}
            >
              Explore All Features
            </DoodleButton>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-kid-green" />
              <span>10,000+ Active Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-kid-yellow" />
              <span>98% Satisfaction Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-kid-purple" />
              <span>Instant Setup</span>
            </div>
          </div>
        </div>

        {/* Secondary CTA Section */}
        <div className="bg-gradient-to-r from-background/90 to-background/80 backdrop-blur rounded-3xl p-8 border-4 border-dashed border-kid-blue/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Still Not Convinced?
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Take a quick tour of our platform and see how it can revolutionize your learning experience. 
                No commitment required – just pure educational innovation at your fingertips.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-kid-green rounded-full"></div>
                  <span className="text-sm">✅ No credit card required</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-kid-blue rounded-full"></div>
                  <span className="text-sm">✅ Full access to all features</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-kid-purple rounded-full"></div>
                  <span className="text-sm">✅ Cancel anytime</span>
                </div>
              </div>

              <DoodleButton
                color="green"
                size="lg"
                onClick={handleGetStarted}
                className="w-full sm:w-auto"
              >
                Try It Risk-Free
              </DoodleButton>
            </div>

            {/* Right Content - Feature Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-kid-blue/20 to-kid-purple/20 rounded-2xl p-6 border-2 border-dashed border-kid-blue/40">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg mb-2">What You'll Get Instantly</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center border border-border">
                    <BookOpen className="w-6 h-6 text-kid-blue mx-auto mb-1" />
                    <p className="text-xs font-medium">Smart Flashcards</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center border border-border">
                    <Target className="w-6 h-6 text-kid-green mx-auto mb-1" />
                    <p className="text-xs font-medium">Study Planner</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center border border-border">
                    <Sparkles className="w-6 h-6 text-kid-purple mx-auto mb-1" />
                    <p className="text-xs font-medium">AI Tutor</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center border border-border">
                    <Zap className="w-6 h-6 text-kid-yellow mx-auto mb-1" />
                    <p className="text-xs font-medium">Quick Tests</p>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <span className="text-xs text-muted-foreground">+ 46 more learning tools</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Urgency Message */}
        <div className="text-center mt-12">
          <p className="text-lg font-medium text-muted-foreground">
            🚀 <span className="text-foreground">2,500+ students</span> joined this week. 
            <span className="text-foreground"> Don't miss out!</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingCallToAction;
