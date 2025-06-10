import React, { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeTracking } from '@/contexts/AutoTimeTrackingContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Clock, Calendar, Users, BarChart3 } from 'lucide-react';

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user } = useAuth();
  const { 
    getTotalFormatted, 
    getSessionFormatted,
    totalTime,
    currentSessionTime,
    isTracking 
  } = useTimeTracking();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        console.log('[ProfilePage] No user UID available');
        return;
      }

      console.log('[ProfilePage] Fetching profile for user:', user.uid);

      try {
        const profileDocRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileDocRef);

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          console.log('[ProfilePage] Profile loaded:', profileData);
          setUsername(profileData.username || '');
        } else {
          console.log('[ProfilePage] Profile does not exist yet, will create on update');
        }
      } catch (error) {
        console.error('[ProfilePage] Error fetching profile:', error);
        toast.error('Error loading profile');
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async () => {
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    // Check username length limit
    if (username.trim().length > 15) {
      toast.error('Maximum 15 letter allowed :) .');
      return;
    }
    
    setLoading(true);
    console.log('[ProfilePage] Updating profile for user:', user.uid, 'with username:', username);
    
    try {
      const profileDocRef = doc(db, 'profiles', user.uid);
      
      // Check if the profile exists
      const profileDoc = await getDoc(profileDocRef);
      
      const profileData = {
        username: username.trim(),
        email: user.email,
        updatedAt: new Date().toISOString(),
      };

      if (!profileDoc.exists()) {
        console.log('[ProfilePage] Creating new profile');
        // If profile doesn't exist, create it
        await setDoc(profileDocRef, {
          ...profileData,
          uid: user.uid,
          createdAt: new Date().toISOString(),
        });
      } else {
        console.log('[ProfilePage] Updating existing profile');
        // If profile exists, update it
        await updateDoc(profileDocRef, profileData);
      }

      console.log('[ProfilePage] Profile updated successfully');
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('[ProfilePage] Error updating profile:', error);
      // Check if it's a permission error (likely due to length limit)
      if (error instanceof Error && error.message.includes('insufficient permissions')) {
        toast.error('Maximum 15 letter allowed :) .');
      } else {
        toast.error('Error updating profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center mb-8">Profile Settings</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Display Name
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <Button
                  onClick={updateProfile}
                  disabled={loading || !username.trim()}
                  className="w-full"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </Card>

            {/* Time Tracking Statistics Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Learning Time Statistics
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {getTotalFormatted()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Time
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {getSessionFormatted()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current Session
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-muted-foreground">
                      {isTracking ? 'Currently Active' : 'Not Active'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Statistics Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Learning Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {Math.floor(totalTime / 3600) || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Hours
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {Math.floor((currentSessionTime || 0) / 60) || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Session Minutes
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {isTracking ? '🔥' : '💤'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Status
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
