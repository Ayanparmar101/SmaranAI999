// Firebase message storage service
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  getDocs,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { toast } from 'sonner';

// Message interface for Firebase
export interface FirebaseMessage {
  id?: string;
  text: string;
  userId: string;
  aiResponse?: string;
  chatType: string;
  imageUrl?: string;
  toolType?: string;
  additionalData?: Record<string, any>;
  timestamp: Timestamp;
  createdAt: Timestamp;
}

// Save message to Firebase Firestore
export const saveMessageToFirebase = async ({
  text,
  userId,
  aiResponse,
  chatType,
  imageUrl,
  toolType,
  additionalData
}: {
  text: string;
  userId: string;
  aiResponse?: string;
  chatType: string;
  imageUrl?: string;
  toolType?: string;
  additionalData?: Record<string, any>;
}): Promise<boolean> => {
  try {
    const messagesRef = collection(db, 'messages');
    const now = Timestamp.now();
    
    // Create the message object and filter out undefined values
    const messageData: any = {
      text,
      userId,
      chatType,
      timestamp: now,
      createdAt: now
    };

    // Only add optional fields if they have defined values
    if (aiResponse !== undefined) {
      messageData.aiResponse = aiResponse;
    }
    if (imageUrl !== undefined) {
      messageData.imageUrl = imageUrl;
    }
    if (toolType !== undefined) {
      messageData.toolType = toolType;
    }
    if (additionalData !== undefined) {
      messageData.additionalData = additionalData;
    }
    
    await addDoc(messagesRef, messageData);

    console.log('Message saved to Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error saving message to Firebase:', error);
    toast.error('Failed to save message to history');
    return false;
  }
};

// Get messages for a specific user
export const getUserMessages = async (userId: string): Promise<FirebaseMessage[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const messages: FirebaseMessage[] = [];

    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseMessage);
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages from Firebase:', error);
    toast.error('Failed to load message history');
    return [];
  }
};

// Listen to real-time message updates
export const subscribeToUserMessages = (
  userId: string,
  callback: (messages: FirebaseMessage[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const messages: FirebaseMessage[] = [];
        querySnapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          } as FirebaseMessage);
        });
        callback(messages);
      },
      (error) => {
        console.error('Error in Firebase subscription:', error);
        if (onError) {
          onError(error);
        } else {
          toast.error('Connection to message history lost');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up Firebase subscription:', error);
    if (onError) {
      onError(error as Error);
    }
    return () => {}; // Return empty unsubscribe function
  }
};

// Delete a message
export const deleteMessageFromFirebase = async (messageId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    console.log('Message deleted from Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error deleting message from Firebase:', error);
    toast.error('Failed to delete message');
    return false;
  }
};

// Update a message
export const updateMessageInFirebase = async (
  messageId: string,
  updates: Partial<FirebaseMessage>
): Promise<boolean> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      ...updates,
      timestamp: Timestamp.now() // Update timestamp when message is modified
    });
    console.log('Message updated in Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error updating message in Firebase:', error);
    toast.error('Failed to update message');
    return false;
  }
};

// Clear all messages for a user (optional utility function)
export const clearUserMessages = async (userId: string): Promise<boolean> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('All user messages cleared from Firebase');
    return true;
  } catch (error) {
    console.error('Error clearing user messages from Firebase:', error);
    toast.error('Failed to clear message history');
    return false;
  }
};
