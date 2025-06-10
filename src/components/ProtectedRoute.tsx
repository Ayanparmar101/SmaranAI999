
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access this feature');
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
