import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, ImageOff } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { 
  getUserMessages, 
  subscribeToUserMessages, 
  FirebaseMessage 
} from '@/services/firebaseMessageService';

const FirebaseHistoryPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [subscriptionError, setSubscriptionError] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const errorCountRef = useRef<Map<string, number>>(new Map());

  const fetchMessages = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const userMessages = await getUserMessages(user.uid);
      setMessages(userMessages);
      console.log('Fetched messages from Firebase:', userMessages.length);
    } catch (error) {
      console.error('Error fetching messages from Firebase:', error);
      setError('Failed to load messages from Firebase');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Optimized Firebase subscription with error handling
  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up Firebase real-time subscription for user:', user.uid);
    setSubscriptionError(false);

    // Clear failed images when setting up new subscription
    setFailedImages(new Set());
    errorCountRef.current.clear();

    const unsubscribe = subscribeToUserMessages(
      user.uid,
      (updatedMessages) => {
        console.log('Real-time update received from Firebase:', updatedMessages.length);

        // Only update if messages actually changed to prevent unnecessary re-renders
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) === JSON.stringify(updatedMessages)) {
            return prevMessages; // No change, return same reference
          }
          return updatedMessages;
        });

        setSubscriptionError(false);
      },
      (error) => {
        console.error('Firebase subscription error:', error);
        setSubscriptionError(true);

        // Don't show toast on every error to prevent spam
        if (!subscriptionError) {
          toast.error('Connection to message history lost. Please refresh the page.');
        }
      }
    );

    // Initial fetch with error handling
    fetchMessages().catch(error => {
      console.error('Initial fetch failed:', error);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up Firebase subscription');
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, [user?.uid]); // Removed fetchMessages dependency to prevent recreation

  const handleManualRefresh = useCallback(() => {
    // Clear failed images on manual refresh
    setFailedImages(new Set());
    errorCountRef.current.clear();

    fetchMessages();
    toast.success('Refreshing message history...');
  }, [fetchMessages]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      errorCountRef.current.clear();
      setFailedImages(new Set());
    };
  }, []);

  const formatDate = (timestamp: any) => {
    try {
      let date: Date;
      
      // Handle Firebase Timestamp
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getChatTypeLabel = (chatType: string | undefined) => {
    switch (chatType) {
      case 'story-images':
        return 'Story Images';
      case 'voice-bot':
        return 'Voice Bot';
      case 'socratic-tutor':
        return 'Socratic Tutor';
      case 'teacher':
        return 'Teacher';
      case 'gujarati-chatbot':
        return 'Gujarati Chat';
      case 'hindi-chatbot':
        return 'Hindi Chat';
      case 'social-science-chatbot':
        return 'Social Science Chat';
      default:
        return 'Chat';
    }
  };

  const getFilteredMessages = () => {
    if (activeTab === "all") {
      return messages;
    }
    return messages.filter(message => message.chatType === activeTab);
  };

  // Enhanced image error handling to prevent reload loops
  const handleImageError = useCallback((url: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const currentCount = errorCountRef.current.get(url) || 0;

    // Prevent infinite error loops by limiting retries
    if (currentCount >= 3) {
      console.warn(`[FirebaseHistoryPage] Image failed to load after 3 attempts: ${url}`);
      setFailedImages(prev => new Set(prev).add(url));
      return;
    }

    errorCountRef.current.set(url, currentCount + 1);

    // Set fallback image immediately to prevent reload
    const target = event.currentTarget;
    target.style.display = 'none';

    // Mark as failed after a brief delay to prevent re-render loops
    setTimeout(() => {
      setFailedImages(prev => new Set(prev).add(url));
    }, 100);

    console.error(`[FirebaseHistoryPage] Image failed to load (attempt ${currentCount + 1}):`, url);
  }, []);

  // Optimized image component with better error handling
  const OptimizedImage = React.memo(({
    src,
    alt,
    className,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    [key: string]: any;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check if this image has already failed
    if (failedImages.has(src) || imageError) {
      return (
        <div className={`${className} flex items-center justify-center bg-muted border-2 border-dashed border-muted-foreground/25`}>
          <div className="text-center p-4">
            <ImageOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Image unavailable</p>
            <p className="text-xs text-muted-foreground/75">URL may have expired</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {isLoading && (
          <div className={`${className} flex items-center justify-center bg-muted animate-pulse`}>
            <div className="text-center p-4">
              <div className="h-4 w-4 mx-auto mb-2 bg-muted-foreground/25 rounded"></div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'hidden' : 'block'}`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            setIsLoading(false);
            setImageError(true);
            handleImageError(src, e);
          }}
          {...props}
        />
      </div>
    );
  });

  const MessageContent = ({ message }: { message: FirebaseMessage }) => {
    const hasMultipleImages = message.toolType === 'story-series-generator' && 
      message.additionalData && 
      message.additionalData.image_urls && 
      Array.isArray(message.additionalData.image_urls);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline">{getChatTypeLabel(message.chatType)}</Badge>
            <p className="text-xs text-muted-foreground">
              {formatDate(message.createdAt || message.timestamp)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900">
            <p className="font-medium">You:</p>
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>

          {message.aiResponse && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">AI Assistant:</p>
              <p className="whitespace-pre-wrap">{message.aiResponse}</p>
            </div>
          )}

          {hasMultipleImages ? (
            <div className="mt-4">
              <p className="font-medium mb-2">Story Illustrations:</p>
              <Carousel className="w-full">
                <CarouselContent>
                  {message.additionalData.image_urls.map((url: string, idx: number) => (
                    <CarouselItem key={`${message.id}-img-${idx}`} className="basis-1/2 md:basis-1/3">
                      <OptimizedImage
                        src={url}
                        alt={`Story illustration ${idx + 1}`}
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ) : message.imageUrl ? (
            <div className="mt-2">
              <OptimizedImage
                src={message.imageUrl}
                alt="Generated content"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Chat History (Firebase)</h1>
        
        {subscriptionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Unable to receive real-time updates from Firebase. Messages may not appear immediately.</span>
              <button 
                onClick={handleManualRefresh}
                className="ml-4 inline-flex items-center px-3 py-1 text-sm bg-destructive-foreground text-destructive rounded hover:bg-destructive-foreground/90"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="voice-bot">Voice Bot</TabsTrigger>
            <TabsTrigger value="story-images">Stories</TabsTrigger>
            <TabsTrigger value="socratic-tutor">Tutor</TabsTrigger>
            <TabsTrigger value="gujarati-chatbot">Gujarati</TabsTrigger>
            <TabsTrigger value="hindi-chatbot">Hindi</TabsTrigger>
            <TabsTrigger value="social-science-chatbot">Social Science</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : getFilteredMessages().length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No messages found for this category
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {getFilteredMessages().map(message => (
                    <div key={message.id} className="p-4 rounded-lg bg-card border">
                      <MessageContent message={message} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default FirebaseHistoryPage;
