export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          contained: number[] | null
          created_at: string | null
          id: number
          name: string | null
          owner: string | null
        }
        Insert: {
          contained?: number[] | null
          created_at?: string | null
          id?: number
          name?: string | null
          owner?: string | null
        }
        Update: {
          contained?: number[] | null
          created_at?: string | null
          id?: number
          name?: string | null
          owner?: string | null
        }
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          provider: string | null
          selected_accent: string | null
          todos_order: Json | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          provider?: string | null
          selected_accent?: string | null
          todos_order?: Json | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          provider?: string | null
          selected_accent?: string | null
          todos_order?: Json | null
        }
      }
      todos: {
        Row: {
          completed: boolean
          content: string | null
          created_at: string | null
          deadline: string | null
          edit_date: string | null
          id: number
          is_important: boolean | null
          uploader: string | null
        }
        Insert: {
          completed?: boolean
          content?: string | null
          created_at?: string | null
          deadline?: string | null
          edit_date?: string | null
          id?: number
          is_important?: boolean | null
          uploader?: string | null
        }
        Update: {
          completed?: boolean
          content?: string | null
          created_at?: string | null
          deadline?: string | null
          edit_date?: string | null
          id?: number
          is_important?: boolean | null
          uploader?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
