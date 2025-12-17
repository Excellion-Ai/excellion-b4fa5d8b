export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      auth_activity: {
        Row: {
          created_at: string
          email: string
          event_type: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_type: string
          id?: string
          ip_address?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      builder_projects: {
        Row: {
          created_at: string
          id: string
          idea: string
          name: string
          published_at: string | null
          published_url: string | null
          spec: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          idea: string
          name: string
          published_at?: string | null
          published_url?: string | null
          spec?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          idea?: string
          name?: string
          published_at?: string | null
          published_url?: string | null
          spec?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string | null
          details: Json | null
          id: string
          status: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name?: string | null
          details?: Json | null
          id?: string
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          details?: Json | null
          id?: string
          status?: string | null
          total_amount?: number | null
        }
        Relationships: []
      }
      items: {
        Row: {
          business_id: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          metadata: Json | null
          price: number | null
          title: string
          type: string
        }
        Insert: {
          business_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          metadata?: Json | null
          price?: number | null
          title: string
          type: string
        }
        Update: {
          business_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          metadata?: Json | null
          price?: number | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          additional_notes: string | null
          brand_content_status: string | null
          brand_name: string | null
          budget: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          features_needed: string[] | null
          id: string
          main_outcome: string | null
          name: string
          pages_needed: string | null
          phone: string | null
          phone_normalized: string | null
          project_type: string
          qualified_plan: string | null
          source: string | null
          timeline: string | null
          user_id: string | null
          whatsapp_e164: string | null
          whatsapp_raw: string | null
        }
        Insert: {
          additional_notes?: string | null
          brand_content_status?: string | null
          brand_name?: string | null
          budget?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          features_needed?: string[] | null
          id?: string
          main_outcome?: string | null
          name: string
          pages_needed?: string | null
          phone?: string | null
          phone_normalized?: string | null
          project_type: string
          qualified_plan?: string | null
          source?: string | null
          timeline?: string | null
          user_id?: string | null
          whatsapp_e164?: string | null
          whatsapp_raw?: string | null
        }
        Update: {
          additional_notes?: string | null
          brand_content_status?: string | null
          brand_name?: string | null
          budget?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          features_needed?: string[] | null
          id?: string
          main_outcome?: string | null
          name?: string
          pages_needed?: string | null
          phone?: string | null
          phone_normalized?: string | null
          project_type?: string
          qualified_plan?: string | null
          source?: string | null
          timeline?: string | null
          user_id?: string | null
          whatsapp_e164?: string | null
          whatsapp_raw?: string | null
        }
        Relationships: []
      }
      site_analytics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          page_path: string
          project_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string
          project_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string
          project_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
