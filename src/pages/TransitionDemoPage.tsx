import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Zap, Eye, ArrowRight, RotateCcw } from 'lucide-react';

const TransitionDemoPage = () => {
  const navigate = useNavigate();

  const demoPages = [
    { path: '/subjects', name: 'Subjects', description: 'Main subjects page with fast transition' },
    { path: '/mathematics', name: 'Mathematics', description: 'Math page with fast transition' },
    { path: '/voice-assistant', name: 'Voice Assistant', description: 'Voice page with fast transition' },
    { path: '/profile', name: 'Profile', description: 'Profile page with fast transition' },
    { path: '/pomodoro', name: 'Pomodoro', description: 'Timer page with fast transition' },
    { path: '/study-planner', name: 'Study Planner', description: 'Planner with fast transition' }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Fast Page Transitions
          </h1>
          <p className="text-muted-foreground">
            Experience fast 150ms page transitions throughout Smaran.ai
          </p>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              How to Use
            </CardTitle>
            <CardDescription>
              Navigate between pages to see fast transitions in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Fast Transition</p>
                  <p className="text-sm text-muted-foreground">Quick 150ms slide up with fade effect</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Optimized Performance</p>
                  <p className="text-sm text-muted-foreground">Smooth and responsive navigation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Accessibility First</p>
                  <p className="text-sm text-muted-foreground">Respects reduced motion preferences</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Try Different Pages
            </CardTitle>
            <CardDescription>
              Click on any page below to experience the transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoPages.map((page) => (
                <Button
                  key={page.path}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => navigate(page.path)}
                >
                  <div>
                    <div className="font-medium">{page.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {page.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>
              Fast and accessible page transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Fast Performance</p>
                  <p className="text-sm text-muted-foreground">Optimized 150ms transitions for quick navigation</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Consistent Experience</p>
                  <p className="text-sm text-muted-foreground">Uniform transitions across all pages</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Accessibility</p>
                  <p className="text-sm text-muted-foreground">Respects reduced motion preferences</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Transitions are automatically disabled for users who prefer reduced motion</p>
      </div>
    </div>
  );
};

export default TransitionDemoPage;
