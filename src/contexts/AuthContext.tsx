import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/integrations/firebase/client'; // Import db (Firestore instance)
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import Firestore methods

import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean; 
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>; // Added optional username
  signOut: () => Promise<void>;
  sendVerificationEmail: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] Setting up Firebase auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed. User:', firebaseUser);
      if (firebaseUser) {
        // Ensure we have the latest user data (especially emailVerified)
        await reload(firebaseUser);
        const refreshedUser = auth.currentUser; // Get the fresh user object
        setUser(refreshedUser);

        if (refreshedUser) {
            const isEmailPasswordProvider = refreshedUser.providerData.some(provider => provider.providerId === 'password');
            if (isEmailPasswordProvider) {
                setIsAuthenticated(refreshedUser.emailVerified);
                if (!refreshedUser.emailVerified) {
                    console.log('[AuthContext] User present but email not verified.');
                }
            } else {
                setIsAuthenticated(true); // Social logins are considered authenticated
            }
        } else {
             setIsAuthenticated(false); // Should not happen if firebaseUser was present
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false); 
    });
    return () => {
      console.log('[AuthContext] Cleaning up Firebase auth state listener...');
      unsubscribe();
    };
  }, []); 

  const signInFn = async (email: string, password: string): Promise<void> => {
    setLoading(true); 
    try {
      console.log('[AuthContext] Attempting Firebase email/password sign in...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will trigger and handle setting user and isAuthenticated states
      // including email verification check by reloading the user.
      // We just need to check if the sign-in itself was successful to show a toast.
      if (userCredential.user) {
        // The toast shown here might be slightly before onAuthStateChanged fully updates isAuthenticated
        // but it gives immediate feedback.
        if (userCredential.user.emailVerified) {
            toast.success('Signed in successfully!');
        } else {
            toast.info('Sign-in successful. Please verify your email to access the application. Check your inbox.', { duration: 7000 });
        }
      }
    } catch (error: any) {
      console.error('[AuthContext] Firebase Sign In Error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password. Please try again or sign up.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many sign-in attempts. Please try again later.');
      } else {
        toast.error(error.message || 'Failed to sign in.');
      }
      throw error; 
    } finally {
        setLoading(false); 
    }
  };

  // Updated signUpFn to include username and create profile document
  const signUpFn = async (email: string, password: string, usernameInput?: string): Promise<void> => {
     setLoading(true); 
    try {
      console.log('[AuthContext] Attempting Firebase email/password sign up...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userFirebase = userCredential.user;

      if (userFirebase) { 
        // Create a profile document in Firestore
        try {
          const profileDocRef = doc(db, "profiles", userFirebase.uid);
          const defaultUsername = usernameInput || email.split('@')[0]; // Use provided username or email prefix
          await setDoc(profileDocRef, {
            uid: userFirebase.uid,
            email: userFirebase.email,
            username: defaultUsername,
            createdAt: new Date().toISOString() // Optional: add a creation timestamp
          });
          console.log('[AuthContext] Profile document created in Firestore for UID:', userFirebase.uid);
        } catch (firestoreError) {
          console.error('[AuthContext] Error creating profile document in Firestore:', firestoreError);
          // Decide if this should be a critical error or just a warning
          toast.warn('Account created, but failed to save profile information.');
        }
        await internalSendVerificationEmail(userFirebase); 
      }
      toast.success('Account created! Please check your email for verification.');
    } catch (error: any) {
      console.error('[AuthContext] Firebase Sign Up Error:', error);
      toast.error(error.message || 'Failed to sign up.');
       throw error; 
    } finally {
        setLoading(false); 
    }
  };

  const signOutActualFn = async (): Promise<void> => {
     setLoading(true); 
    try {
       console.log('[AuthContext] Attempting Firebase sign out...');
       await firebaseSignOut(auth); 
       toast.info('Signed out.');
    } catch (error: any) {
       console.error('[AuthContext] Firebase Sign Out Error:', error);
       toast.error(error.message || 'Failed to sign out.');
        throw error; 
    } finally {
        setLoading(false); 
    }
  };

  const internalSendVerificationEmail = async(user:User):Promise<void> => {
    try{
      await sendEmailVerification(user);
      toast.success('Verification email sent. Please check your inbox!');
    }catch(error:any){
      console.error('Error while sending verification email:', error); 
      toast.error(error.message||'Error while sending verification email');
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    signIn: signInFn,
    signUp: signUpFn,
    signOut: signOutActualFn,
    sendVerificationEmail: internalSendVerificationEmail 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
