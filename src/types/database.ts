export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          online_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          online_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          online_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          type: 'private' | 'group' | 'channel'
          name: string | null
          description: string | null
          avatar_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'private' | 'group' | 'channel'
          name?: string | null
          description?: string | null
          avatar_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'private' | 'group' | 'channel'
          name?: string | null
          description?: string | null
          avatar_url?: string | null
          created_by?: string | null
          updated_at?: string
        }
      }
      chat_members: {
        Row: {
          chat_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          chat_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          role?: 'owner' | 'admin' | 'member'
          last_read_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          user_id: string | null
          content: string | null
          type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'system'
          media_url: string | null
          reply_to_id: string | null
          forwarded_from_id: string | null
          edited_at: string | null
          deleted_at: string | null
          pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id?: string | null
          content?: string | null
          type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'system'
          media_url?: string | null
          reply_to_id?: string | null
          forwarded_from_id?: string | null
          edited_at?: string | null
          deleted_at?: string | null
          pinned?: boolean
          created_at?: string
        }
        Update: {
          content?: string | null
          edited_at?: string | null
          deleted_at?: string | null
          pinned?: boolean
        }
      }
      reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          emoji?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emoji?: string | null
          position?: number
          created_at?: string
        }
        Update: {
          name?: string
          emoji?: string | null
          position?: number
        }
      }
      folder_chats: {
        Row: {
          folder_id: string
          chat_id: string
        }
        Insert: {
          folder_id: string
          chat_id: string
        }
        Update: Record<string, never>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Chat = Database['public']['Tables']['chats']['Row']
export type ChatMember = Database['public']['Tables']['chat_members']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type FolderChat = Database['public']['Tables']['folder_chats']['Row']

export interface ChatWithLastMessage extends Chat {
  last_message?: Message & { sender?: Profile }
  unread_count?: number
  members?: (ChatMember & { profile: Profile })[]
  other_user?: Profile  // for private chats
}

export interface MessageWithSender extends Message {
  sender?: Profile
  reactions?: (Reaction & { user?: Profile })[]
  reply_to?: MessageWithSender
}
