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
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      user_activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      images: {
        Row: {
          id: string
          user_id: string
          title: string
          aircraft_registration: string
          airline: string
          airport: string
          camera_model: string
          aircraft_model: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          exif_data: Json | null
          is_hot: boolean
          hot_reason: string | null
          admin_notes: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          aircraft_registration: string
          airline: string
          airport: string
          camera_model: string
          aircraft_model: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          exif_data?: Json | null
          is_hot?: boolean
          hot_reason?: string | null
          admin_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          aircraft_registration?: string
          airline?: string
          airport?: string
          camera_model?: string
          aircraft_model?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          exif_data?: Json | null
          is_hot?: boolean
          hot_reason?: string | null
          admin_notes?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          image_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      downloads: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string
          target_id: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type: string
          target_id: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: string
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
      }
      admin_user_stats: {
        Row: {
          total_users: number
          admin_count: number
          new_users_30d: number
        }
      }
    }
    Functions: {
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      get_user_role: {
        Args: {
          user_id?: string
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          action_type: string
          ip_addr?: string
          user_agent_text?: string
          metadata_json?: Json
        }
        Returns: undefined
      }
      cleanup_old_activity_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
      image_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
