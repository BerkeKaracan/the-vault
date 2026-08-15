export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      materials: {
        Row: {
          author: string | null
          categories: string[] | null
          cover_url: string | null
          created_at: string
          current_page: number
          description: string | null
          google_books_id: string | null
          id: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          published_date: string | null
          publisher: string | null
          source: Database["public"]["Enums"]["material_source"]
          status: Database["public"]["Enums"]["material_status"]
          tags: string[]
          title: string
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number
          description?: string | null
          google_books_id?: string | null
          id?: string
          metric_type?: Database["public"]["Enums"]["metric_type"]
          published_date?: string | null
          publisher?: string | null
          categories?: string[] | null
          source: Database["public"]["Enums"]["material_source"]
          status?: Database["public"]["Enums"]["material_status"]
          tags?: string[]
          title: string
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number
          description?: string | null
          google_books_id?: string | null
          id?: string
          metric_type?: Database["public"]["Enums"]["metric_type"]
          published_date?: string | null
          publisher?: string | null
          categories?: string[] | null
          source?: Database["public"]["Enums"]["material_source"]
          status?: Database["public"]["Enums"]["material_status"]
          tags?: string[]
          title?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: Database["public"]["Enums"]["accent_color"]
          created_at: string
          daily_goal: number | null
          display_name: string | null
          focus_mode: boolean
          id: string
          timezone: string
          updated_at: string
          week_starts_on: Database["public"]["Enums"]["week_start"]
          color_scheme: Database["public"]["Enums"]["color_scheme"]
        }
        Insert: {
          accent_color?: Database["public"]["Enums"]["accent_color"]
          created_at?: string
          daily_goal?: number | null
          display_name?: string | null
          focus_mode?: boolean
          id: string
          timezone?: string
          updated_at?: string
          week_starts_on?: Database["public"]["Enums"]["week_start"]
          color_scheme?: Database["public"]["Enums"]["color_scheme"]
        }
        Update: {
          accent_color?: Database["public"]["Enums"]["accent_color"]
          created_at?: string
          daily_goal?: number | null
          display_name?: string | null
          focus_mode?: boolean
          id?: string
          timezone?: string
          updated_at?: string
          week_starts_on?: Database["public"]["Enums"]["week_start"]
          color_scheme?: Database["public"]["Enums"]["color_scheme"]
        }
        Relationships: []
      }
      material_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          material_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          material_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          material_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_notes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          created_at: string
          duration_seconds: number
          ended_at: string
          id: string
          material_id: string
          started_at: string
          units_delta: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          ended_at: string
          id?: string
          material_id: string
          started_at: string
          units_delta?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string
          id?: string
          material_id?: string
          started_at?: string
          units_delta?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_entries: {
        Row: {
          created_at: string
          id: string
          logged_on: string
          material_id: string
          page_after: number
          pages_delta: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_on: string
          material_id: string
          page_after: number
          pages_delta: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_on?: string
          material_id?: string
          page_after?: number
          pages_delta?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_progress: {
        Args: {
          p_logged_on: string
          p_material_id: string
          p_page_after: number
        }
        Returns: {
          author: string | null
          categories: string[] | null
          cover_url: string | null
          created_at: string
          current_page: number
          description: string | null
          google_books_id: string | null
          id: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          published_date: string | null
          publisher: string | null
          source: Database["public"]["Enums"]["material_source"]
          status: Database["public"]["Enums"]["material_status"]
          tags: string[]
          title: string
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "materials"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      accent_color: "emerald" | "blue" | "amber"
      color_scheme: "dark" | "light"
      material_source: "google" | "custom"
      material_status: "active" | "shelved" | "completed"
      metric_type: "pages" | "questions" | "chapters"
      week_start: "monday" | "sunday"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      accent_color: ["emerald", "blue", "amber"],
      color_scheme: ["dark", "light"],
      material_source: ["google", "custom"],
      material_status: ["active", "shelved", "completed"],
      metric_type: ["pages", "questions", "chapters"],
      week_start: ["monday", "sunday"],
    },
  },
} as const

