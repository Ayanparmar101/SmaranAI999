
import type { Database } from './types';

// Extend the Database type to include our new messages table
export interface CustomDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      messages: {
        Row: {
          id: string;
          text: string;
          user_id: string;
          ai_response: string | null;
          chat_type: string | null;
          image_url: string | null;
          tool_type: string | null;
          additional_data: any | null;
          timestamp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          user_id: string;
          ai_response?: string | null;
          chat_type?: string | null;
          image_url?: string | null;
          tool_type?: string | null;
          additional_data?: any | null;
          timestamp: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          user_id?: string;
          ai_response?: string | null;
          chat_type?: string | null;
          image_url?: string | null;
          tool_type?: string | null;
          additional_data?: any | null;
          timestamp?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}
