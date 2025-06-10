import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/integrations/firebase/client'; // Import Firebase auth instance
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth'; 

import { Button } from '@/components/ui/button';
import DoodleButton from '@/components/DoodleButton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [pageLoading, setPageLoading] = useState(false); 
  // This local loading state is primarily for the initial auth check within this component
  const [authStatusChecked, setAuthStatusChecked] = useState(false);
  const navigate = useNavigate();
  const { signIn: contextSignIn, signUp: contextSignUp, user: authUser, isAuthenticated, loading: authContextLoading } = useAuth();

  useEffect(() => {
    console.log('[AuthPage] useEffect for onAuthStateChanged mounting...');
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      console.log('[AuthPage] onAuthStateChanged triggered. User:', user);
      setAuthStatusChecked(true); // Mark that this component's initial auth check has run

      // If user is authenticated (verified) and on /auth page, AuthGuard should ideally handle redirecting them away.
      // However, a direct redirect here IF ALREADY AUTHENTICATED (from AuthContext) can be a fallback.
      if (isAuthenticated && user) { // Check isAuthenticated from context
        if (window.location.pathname === '/auth' || window.location.pathname === '/auth/callback') {
          console.log('[AuthPage] User is already authenticated (verified), redirecting to /subjects via AuthContext state.');
          navigate('/subjects', { replace: true });
        }
      } else if (user && !user.emailVerified && user.providerData.some(p => p.providerId === 'password')) {
        console.log('[AuthPage] User signed in but email not verified. Staying on /auth page.');
      } else if (!user) {
        console.log('[AuthPage] No user or user signed out. Staying on /auth page.');
      }
    });

    return () => {
      console.log('[AuthPage] useEffect for onAuthStateChanged unmounting...');
      unsubscribe();
    }
  }, [navigate, isAuthenticated, authUser]); // Added isAuthenticated and authUser to dependencies

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageLoading(true);
    try {
      if (isSignUp) {
        console.log('[AuthPage] Attempting Firebase email/password sign up...');
        await contextSignUp(email, password);
      } else {
        console.log('[AuthPage] Attempting Firebase email/password sign in...');
        await contextSignIn(email, password);
      }
    } catch (error: any) {
      console.error('[AuthPage] Email/Password Auth Error (from AuthPage catch block):', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setPageLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      console.log('[AuthPage] Attempting Google login with Firebase...');
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google!'); 
    } catch (error: any) {
      console.error('[AuthPage] Firebase Google login error:', error);
      const errorCode = error.code;
      // Simplified error message for brevity
      toast.error(error.message || 'Google login failed.');
    } finally {
      setPageLoading(false);
    }
  };
  
  // Show a generic loading for the page if AuthContext is loading or local auth check hasn't completed.
  if (authContextLoading || !authStatusChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card className="p-8 shadow-lg rounded-3xl border-2 border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text-animated mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Join the fun learning adventure!' : 'Sign in to continue your learning journey'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <DoodleButton 
            type="submit"
            color={isSignUp ? "green" : "blue"}
            loading={pageLoading}
            className="w-full"
            icon={isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </DoodleButton>
        </form>

        <div className="relative flex items-center justify-center mt-6 mb-6">
          <div className="absolute w-full border-t border-gray-300"></div>
          <div className="relative bg-white px-4 text-sm text-gray-500">
            Or continue with
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={pageLoading}
          className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
          variant="outline"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"></path>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"></path>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"></path>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"></path>
            </g>
          </svg>
          <span>Google</span>
        </Button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
