import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[AuthGuard] useEffect triggered. Loading:', loading, 'IsAuthenticated:', isAuthenticated, 'User:', user, 'Path:', location.pathname);
    if (loading) {
      console.log('[AuthGuard] Still loading auth state, returning.');
      return;
    }
    
    // Allow access to authentication pages without being logged in
    if (location.pathname === '/auth' || location.pathname === '/auth-callback') {
      console.log('[AuthGuard] On auth page, no redirect needed.');
      return;
    }
    
    if (!isAuthenticated) {
      // Check if user exists but email is not verified (for email/password sign-ups)
      const isEmailPasswordProvider = user?.providerData.some(provider => provider.providerId === 'password');
      if (user && isEmailPasswordProvider && !user.emailVerified) {
        console.log('[AuthGuard] User exists but email not verified. Redirecting to /auth.');
        toast.info('Please verify your email to continue. Check your inbox for a verification link.', {
          duration: 5000, // Longer duration for this important message
        });
      } else {
        console.log('[AuthGuard] Not authenticated (or email not verified for other reasons). Redirecting to /auth.');
        toast.error('Please sign in to access this page', {
          duration: 3000,
        });
      }
      
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?returnUrl=${returnUrl}`, { replace: true });
    } else {
      console.log('[AuthGuard] Authenticated and email verified (if applicable), access granted.');
    }
  }, [user, isAuthenticated, loading, navigate, location]);

  // When loading, show a loading state instead of null to prevent layout shifts
  if (loading) {
    console.log('[AuthGuard] Rendering loading state.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If we're on auth pages or authenticated (and email verified), render children
  if (isAuthenticated || location.pathname === '/auth' || location.pathname === '/auth-callback') {
    console.log('[AuthGuard] Rendering children. IsAuthenticated:', isAuthenticated, 'Path:', location.pathname);
    return <>{children}</>;
  }

  // Otherwise, show loading while redirect happens (or if access is denied)
  console.log('[AuthGuard] Rendering loading state while redirect happens or access denied.');
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthGuard;
