import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/firebase/client'; // Import Firestore instance
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore methods
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { NeoButton } from '@/components/NeoButton';

const AuthButton = () => {
  const { user, signOut: firebaseSignOut } = useAuth();
  const navigate = useNavigate(); // Keep navigate if still needed for other actions, though not for sign-out redirect
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user?.uid) { // Check for Firebase user UID
        console.log('[AuthButton] No Firebase user ID, cannot fetch username.');
        setUsername(user?.displayName || user?.email?.split('@')[0] || null); // Fallback to displayName or email prefix
        return;
      }
      
      console.log(`[AuthButton] Fetching username for UID: ${user.uid}`);
      try {
        const profileDocRef = doc(db, "profiles", user.uid); // Assumes a 'profiles' collection with document ID as user.uid
        const profileDoc = await getDoc(profileDocRef);

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          console.log('[AuthButton] Profile data from Firestore:', profileData);
          setUsername(profileData.username || user.displayName || user.email?.split('@')[0]);
        } else {
          console.log('[AuthButton] No profile document found in Firestore for UID:', user.uid);
          // Fallback if no profile doc, or create one (outside scope of this component)
          setUsername(user.displayName || user.email?.split('@')[0]); 
        }
      } catch (error) {
        console.error('[AuthButton] Error fetching username from Firestore:', error);
        setUsername(user.displayName || user.email?.split('@')[0]); // Fallback in case of error
      }
    };

    if (user) {
      fetchUsername();
    } else {
      setUsername(null); // Clear username if no user
    }
  }, [user]); // Re-run when user object changes

  const handleSignOut = async () => {
    console.log('[AuthButton] Handling sign out...');
    try {
      await firebaseSignOut(); 
      toast.success('Signed out successfully');
      // AuthGuard should handle navigation to /auth upon state change
      console.log('[AuthButton] Sign out successful, AuthGuard should handle redirect.');
    } catch (error: any) {
      console.error('[AuthButton] Firebase Sign Out Error:', error);
      toast.error(error.message || 'Error signing out');
    }
  };

  if (!user) {
    return (
      <Link to="/auth">
        <NeoButton 
          variant="primary" 
          size="sm" 
          icon={<LogIn className="h-4 w-4" />}
        >
          Sign In
        </NeoButton>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NeoButton 
          variant="outline" 
          size="sm" 
          icon={<UserRound className="h-4 w-4" />}
        >
          <span className="max-w-[80px] sm:max-w-[100px] truncate text-xs sm:text-sm">
            {username || user.displayName || user.email?.split('@')[0] || 'User'}
          </span>
        </NeoButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
