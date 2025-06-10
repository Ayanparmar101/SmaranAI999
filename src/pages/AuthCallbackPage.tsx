
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get URL hash parameter for parsing in Auth
      const hashParams = window.location.hash;
      
      try {
        if (hashParams) {
          // Handle the OAuth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data && data.session) {
            // Successfully authenticated
            navigate('/');
          } else {
            // No session found, redirect to auth page
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Completing authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
