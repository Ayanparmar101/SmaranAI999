import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
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

interface ChatMessage {
  id: string;
  text: string;
  createdAt: any;
  userId: string;
  timestamp: any;
  toolType?: string;
  imageUrl?: string;
  aiResponse?: string;
  chatType?: string;
  additionalData?: any;
}

const HistoryPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [subscriptionError, setSubscriptionError] = useState<boolean>(false);

  const fetchMessages = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setError(null);
      
      const firebaseMessages = await getUserMessages(user.uid);
      
      // Convert Firebase messages to our ChatMessage format
      const convertedMessages: ChatMessage[] = firebaseMessages.map(msg => ({
        id: msg.id || '',
        text: msg.text,
        createdAt: msg.createdAt,
        userId: msg.userId,
        timestamp: msg.timestamp,
        toolType: msg.toolType,
        imageUrl: msg.imageUrl,
        aiResponse: msg.aiResponse,
        chatType: msg.chatType,
        additionalData: msg.additionalData
      }));

      console.log('Fetched Firebase messages:', convertedMessages.length);
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Error in messages fetch:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user?.uid) return null;
    
    console.log('Setting up Firebase real-time subscription for user:', user?.uid);
    setSubscriptionError(false);
    
    const unsubscribe = subscribeToUserMessages(
      user.uid,
      (firebaseMessages) => {
        console.log('Real-time Firebase messages received:', firebaseMessages.length);
        
        // Convert Firebase messages to our ChatMessage format
        const convertedMessages: ChatMessage[] = firebaseMessages.map(msg => ({
          id: msg.id || '',
          text: msg.text,
          createdAt: msg.createdAt,
          userId: msg.userId,
          timestamp: msg.timestamp,
          toolType: msg.toolType,
          imageUrl: msg.imageUrl,
          aiResponse: msg.aiResponse,
          chatType: msg.chatType,
          additionalData: msg.additionalData
        }));
        
        setMessages(convertedMessages);
        setSubscriptionError(false);
      },
      (error) => {
        console.error('Firebase subscription error:', error);
        setSubscriptionError(true);
      }
    );
    
    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    let unsubscribe = setupRealtimeSubscription();
    let retryCount = 0;
    const maxRetries = 3;
    
    const retrySubscription = () => {
      if (retryCount < maxRetries && subscriptionError) {
        console.log(`Retrying Firebase subscription (${retryCount + 1}/${maxRetries})...`);
        
        if (unsubscribe) {
          unsubscribe();
        }
        
        setTimeout(() => {
          unsubscribe = setupRealtimeSubscription();
          retryCount++;
        }, 2000 * (retryCount + 1));
      }
    };

    const retryTimer = subscriptionError ? setTimeout(retrySubscription, 2000) : null;

    fetchMessages();

    return () => {
      console.log('Cleaning up Firebase subscription');
      if (unsubscribe) {
        unsubscribe();
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [user, fetchMessages, setupRealtimeSubscription, subscriptionError]);

  const handleManualRefresh = () => {
    fetchMessages();
    
    if (subscriptionError) {
      const unsubscribe = setupRealtimeSubscription();
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  };

  const formatDate = (date: any) => {
    try {
      // Handle Firebase Timestamp
      if (date && typeof date.toDate === 'function') {
        return new Date(date.toDate()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      // Handle regular Date or number
      if (date) {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Unknown time';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
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
        return 'Social Science';
      case 'study-planner':
        return 'Study Planner';
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

  const MessageContent = ({ message }: { message: ChatMessage; }) => {
    const hasMultipleImages = message.toolType === 'story-series-generator' && message.additionalData && 
      message.additionalData.image_urls && Array.isArray(message.additionalData.image_urls);

    return <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline">{getChatTypeLabel(message.chatType)}</Badge>
          <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
        </div>

        <div className="p-3 rounded-lg bg-zinc-900">
          <p className="font-medium">You:</p>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {message.aiResponse && <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium">AI Assistant:</p>
            <p className="whitespace-pre-wrap">{message.aiResponse}</p>
          </div>}

        {hasMultipleImages ? (
          <div className="mt-4">
            <p className="font-medium mb-2">Story Illustrations:</p>
            <Carousel className="w-full">
              <CarouselContent>
                {message.additionalData.image_urls.map((url: string, idx: number) => (
                  <CarouselItem key={idx} className="basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white p-1 h-[200px] flex items-center justify-center">
                      <img 
                        src={url} 
                        alt={`Story illustration ${idx + 1}`} 
                        className="max-h-full max-w-full object-contain"
                        onError={e => {
                          console.error('Image failed to load:', url);
                          e.currentTarget.src = '/placeholder.svg';
                          e.currentTarget.alt = 'Image failed to load';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black text-white text-xs py-1 px-2 rounded-full">
                        {idx + 1}/{message.additionalData.image_urls.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        ) : message.imageUrl ? (
          <div className="mt-2">
            <img 
              src={message.imageUrl} 
              alt="Generated content" 
              className="rounded-lg max-w-full h-auto" 
              loading="lazy" 
              onError={e => {
                console.error('Image failed to load:', message.imageUrl);
                e.currentTarget.src = '/placeholder.svg';
                e.currentTarget.alt = 'Image failed to load';
              }} 
            />
          </div>
        ) : null}
      </div>
    </div>;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Chat History</h1>
        
        {subscriptionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connectivity Issue</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Unable to receive real-time updates. Messages may not appear immediately.</span>
              <button 
                onClick={handleManualRefresh} 
                className="flex items-center text-sm bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground px-2 py-1 rounded-md"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="story-images">Story Images</TabsTrigger>
            <TabsTrigger value="voice-bot">Voice Bot</TabsTrigger>
            <TabsTrigger value="socratic-tutor">Socratic Tutor</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="gujarati-chatbot">Gujarati</TabsTrigger>
            <TabsTrigger value="hindi-chatbot">Hindi</TabsTrigger>
            <TabsTrigger value="social-science-chatbot">Social Science</TabsTrigger>
            <TabsTrigger value="study-planner">Study Planner</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div className="bg-card rounded-lg shadow-md p-6">
              {error ? <div className="text-center py-4 text-red-500">{error}</div> : loading ? <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>)}
                </div> : getFilteredMessages().length === 0 ? <div className="text-center py-4 text-muted-foreground">
                  No messages found for this category
                </div> : <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {getFilteredMessages().map(message => <div key={message.id} className="p-4 rounded-lg bg-card border">
                        <MessageContent message={message} />
                      </div>)}
                  </div>
                </ScrollArea>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default HistoryPage;
