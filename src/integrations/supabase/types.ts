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
      api_usage_logs: {
        Row: {
          created_at: string
          error_message: string | null
          function_name: string
          id: string
          response_time_ms: number | null
          status_code: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          function_name: string
          id?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          function_name?: string
          id?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_id?: string
        }
        Relationships: []
      }
      archived_pricing_tiers: {
        Row: {
          archived_at: string
          created_at: string
          description: string | null
          display_order: number | null
          features: Json
          id: string
          is_highlighted: boolean | null
          name: string
          price_range: string
          tier_type: string
        }
        Insert: {
          archived_at?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_highlighted?: boolean | null
          name: string
          price_range: string
          tier_type: string
        }
        Update: {
          archived_at?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_highlighted?: boolean | null
          name?: string
          price_range?: string
          tier_type?: string
        }
        Relationships: []
      }
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
      bookmarks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          spec: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          spec: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          spec?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_projects: {
        Row: {
          created_at: string
          github_last_synced_at: string | null
          github_repo_url: string | null
          id: string
          idea: string
          name: string
          published_at: string | null
          published_url: string | null
          spec: Json | null
          updated_at: string
          user_id: string | null
          versions: Json | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          github_last_synced_at?: string | null
          github_repo_url?: string | null
          id?: string
          idea: string
          name: string
          published_at?: string | null
          published_url?: string | null
          spec?: Json | null
          updated_at?: string
          user_id?: string | null
          versions?: Json | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          github_last_synced_at?: string | null
          github_repo_url?: string | null
          id?: string
          idea?: string
          name?: string
          published_at?: string | null
          published_url?: string | null
          spec?: Json | null
          updated_at?: string
          user_id?: string | null
          versions?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          course_title: string
          created_at: string
          enrollment_id: string
          id: string
          issued_at: string
          student_name: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          course_title: string
          created_at?: string
          enrollment_id: string
          id?: string
          issued_at?: string
          student_name: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          course_title?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string
          id: string
          is_verified_completion: boolean
          rating: number
          review: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          is_verified_completion?: boolean
          rating: number
          review?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          is_verified_completion?: boolean
          rating?: number
          review?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_views: {
        Row: {
          course_id: string
          created_at: string
          device_type: string | null
          id: string
          referrer: string | null
          viewer_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          device_type?: string | null
          id?: string
          referrer?: string | null
          viewer_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          device_type?: string | null
          id?: string
          referrer?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_views_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          average_rating: number | null
          builder_project_id: string | null
          created_at: string
          currency: string | null
          custom_domain: string | null
          deleted_at: string | null
          description: string | null
          difficulty: string | null
          duration_weeks: number | null
          id: string
          instructor_bio: string | null
          instructor_name: string | null
          modules: Json | null
          page_sections: Json | null
          price_cents: number | null
          published_at: string | null
          published_url: string | null
          review_count: number | null
          seo_description: string | null
          seo_title: string | null
          social_image_url: string | null
          status: string | null
          subdomain: string | null
          thumbnail_url: string | null
          title: string
          total_students: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_rating?: number | null
          builder_project_id?: string | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          modules?: Json | null
          page_sections?: Json | null
          price_cents?: number | null
          published_at?: string | null
          published_url?: string | null
          review_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          social_image_url?: string | null
          status?: string | null
          subdomain?: string | null
          thumbnail_url?: string | null
          title: string
          total_students?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_rating?: number | null
          builder_project_id?: string | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          modules?: Json | null
          page_sections?: Json | null
          price_cents?: number | null
          published_at?: string | null
          published_url?: string | null
          review_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          social_image_url?: string | null
          status?: string | null
          subdomain?: string | null
          thumbnail_url?: string | null
          title?: string
          total_students?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_builder_project_id_fkey"
            columns: ["builder_project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          action_type: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_type?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_type?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_verified: boolean
          last_checked_at: string | null
          project_id: string
          ssl_provisioned: boolean
          ssl_status: string
          status: string
          user_id: string | null
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_verified?: boolean
          last_checked_at?: string | null
          project_id: string
          ssl_provisioned?: boolean
          ssl_status?: string
          status?: string
          user_id?: string | null
          verification_token?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_verified?: boolean
          last_checked_at?: string | null
          project_id?: string
          ssl_provisioned?: boolean
          ssl_status?: string
          status?: string
          user_id?: string | null
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_sites: {
        Row: {
          code: string | null
          created_at: string
          id: string
          prompt: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          prompt: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          prompt?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      github_connections: {
        Row: {
          access_token: string
          connected_at: string
          github_user_id: string | null
          github_username: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          github_user_id?: string | null
          github_username?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          github_user_id?: string | null
          github_username?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
      knowledge_base: {
        Row: {
          content: string
          created_at: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          lesson_id: string
          module_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          module_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
          module_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          course_id: string
          created_at: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_views: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string | null
          id: string
          lesson_id: string
          time_spent_seconds: number | null
          viewer_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          lesson_id: string
          time_spent_seconds?: number | null
          viewer_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          lesson_id?: string
          time_spent_seconds?: number | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_views_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_views_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          course_id: string
          created_at: string
          currency: string
          id: string
          purchased_at: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          course_id: string
          created_at?: string
          currency?: string
          id?: string
          purchased_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          course_id?: string
          created_at?: string
          currency?: string
          id?: string
          purchased_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          course_id: string
          created_at: string
          enrollment_id: string
          id: string
          lesson_id: string
          passed: boolean
          score_percent: number
        }
        Insert: {
          answers?: Json
          course_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          passed?: boolean
          score_percent?: number
        }
        Update: {
          answers?: Json
          course_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
          passed?: boolean
          score_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
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
      support_tickets: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          current_plan: string
          sprint_expires_at: string | null
          sprint_pass_used: boolean
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          current_plan?: string
          sprint_expires_at?: string | null
          sprint_pass_used?: boolean
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          current_plan?: string
          sprint_expires_at?: string | null
          sprint_pass_used?: boolean
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_knowledge: {
        Row: {
          content: string
          created_at: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_settings: {
        Row: {
          accent: string | null
          created_at: string
          notify_billing: boolean
          notify_build_done: boolean
          notify_product: boolean
          notify_publish_done: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string | null
          created_at?: string
          notify_billing?: boolean
          notify_build_done?: boolean
          notify_product?: boolean
          notify_publish_done?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string | null
          created_at?: string
          notify_billing?: boolean
          notify_build_done?: boolean
          notify_product?: boolean
          notify_publish_done?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspace_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          status: string
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          status?: string
          token?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          status?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_memberships_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      github_connections_safe: {
        Row: {
          connected_at: string | null
          github_user_id: string | null
          github_username: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          connected_at?: string | null
          github_user_id?: string | null
          github_username?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          connected_at?: string | null
          github_user_id?: string | null
          github_username?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workspace_invites_safe: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          role: string | null
          status: string | null
          token: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          role?: string | null
          status?: string | null
          token?: never
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          role?: string | null
          status?: string | null
          token?: never
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_domain_verification: {
        Args: { domain_name: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
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
