import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoodleButton from '@/components/DoodleButton';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LandingAuthSection = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created! Please check your email for verification.');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Access to all 50+ learning tools",
    "Personalized AI tutoring",
    "Progress tracking & analytics",
    "Unlimited flashcard creation",
    "Study planner & scheduling",
    "Teacher dashboard (for educators)",
    "Real-time collaboration",
    "24/7 AI support"
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-kid-purple/10 text-kid-purple rounded-full text-sm font-medium mb-4">
            🚀 Get Started Today
          </div>
          <h2 className="section-title">Join Thousands of Successful Learners</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create your free account in seconds and unlock the full potential of AI-powered learning. 
            No credit card required, start learning immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Benefits Column */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-6">What You Get With Your Free Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-kid-green flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-kid-blue/5 to-kid-purple/5 rounded-2xl p-6 border-2 border-dashed border-kid-blue/20">
              <h4 className="font-bold mb-4">Join the Learning Revolution</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-kid-blue">10K+</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-kid-green">95%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-kid-purple">50+</div>
                  <div className="text-xs text-muted-foreground">Tools</div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="space-y-4">
              <h4 className="font-bold">Trusted by Students Worldwide</h4>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-kid-blue to-kid-purple rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">2,500+</span> students joined this week
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form Column */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md p-8 shadow-xl border-4 border-dashed border-kid-blue/30">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  {isSignUp ? 'Create Your Free Account' : 'Welcome Back!'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isSignUp ? 'Start your learning journey today' : 'Continue your learning journey'}
                </p>
              </div>

              <form onSubmit={handleQuickAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-2"
                    required
                  />
                </div>

                <DoodleButton
                  type="submit"
                  color={isSignUp ? "green" : "blue"}
                  size="lg"
                  loading={loading}
                  className="w-full"
                  icon={isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                >
                  {isSignUp ? 'Create Free Account' : 'Sign In'}
                </DoodleButton>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <DoodleButton
                  color="purple"
                  size="md"
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="w-full"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  More Sign-in Options
                </DoodleButton>
              </div>

              {isSignUp && (
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                  Your data is secure and never shared.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAuthSection;
