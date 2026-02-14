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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          position: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          position?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          position?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          email: string | null
          head_name: string | null
          head_photo_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          sort_order: number | null
          total_students: number | null
          total_teachers: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          email?: string | null
          head_name?: string | null
          head_photo_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          sort_order?: number | null
          total_students?: number | null
          total_teachers?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          email?: string | null
          head_name?: string | null
          head_photo_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          sort_order?: number | null
          total_students?: number | null
          total_teachers?: number | null
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          created_at: string
          id: string
          institution: string | null
          is_active: boolean | null
          name: string
          page_slug: string
          photo_url: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean | null
          name: string
          page_slug?: string
          photo_url?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean | null
          name?: string
          page_slug?: string
          photo_url?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          student_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          student_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          student_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          exam_type: string | null
          id: string
          is_published: boolean | null
          name: string
          year: number
        }
        Insert: {
          created_at?: string
          exam_type?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          year: number
        }
        Update: {
          created_at?: string
          exam_type?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          year?: number
        }
        Relationships: []
      }
      leader_profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
          title: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number | null
          title: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          label: string
          parent_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          label: string
          parent_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          label?: string
          parent_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          image_url: string | null
          is_sent: boolean
          link: string | null
          sent_at: string | null
          target: string
          target_value: string | null
          title: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_sent?: boolean
          link?: string | null
          sent_at?: string | null
          target?: string
          target_value?: string | null
          title: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_sent?: boolean
          link?: string | null
          sent_at?: string | null
          target?: string
          target_value?: string | null
          title?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          options: Json
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_name: string | null
          category_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_times: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          time_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          time_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          time_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          created_at: string
          exam_id: string
          gpa: number | null
          grade: string | null
          id: string
          marks_obtained: number | null
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          gpa?: number | null
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          gpa?: number | null
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_year: number | null
          blood_group: string | null
          branch_id: string | null
          class_name: string
          created_at: string
          date_of_birth: string | null
          father_name: string | null
          id: string
          is_active: boolean | null
          mother_name: string | null
          name: string
          nid: string | null
          phone: string | null
          photo_url: string | null
          registration_number: string | null
          roll_number: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_year?: number | null
          blood_group?: string | null
          branch_id?: string | null
          class_name: string
          created_at?: string
          date_of_birth?: string | null
          father_name?: string | null
          id?: string
          is_active?: boolean | null
          mother_name?: string | null
          name: string
          nid?: string | null
          phone?: string | null
          photo_url?: string | null
          registration_number?: string | null
          roll_number: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_year?: number | null
          blood_group?: string | null
          branch_id?: string | null
          class_name?: string
          created_at?: string
          date_of_birth?: string | null
          father_name?: string | null
          id?: string
          is_active?: boolean | null
          mother_name?: string | null
          name?: string
          nid?: string | null
          phone?: string | null
          photo_url?: string | null
          registration_number?: string | null
          roll_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_name: string | null
          code: string | null
          created_at: string
          full_marks: number
          id: string
          name: string
          pass_marks: number
          sort_order: number | null
        }
        Insert: {
          class_name?: string | null
          code?: string | null
          created_at?: string
          full_marks?: number
          id?: string
          name: string
          pass_marks?: number
          sort_order?: number | null
        }
        Update: {
          class_name?: string | null
          code?: string | null
          created_at?: string
          full_marks?: number
          id?: string
          name?: string
          pass_marks?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_student_for_result: {
        Args: { p_class: string; p_roll: string }
        Returns: {
          branch_id: string
          class_name: string
          id: string
          name: string
          photo_url: string
          registration_number: string
          roll_number: string
        }[]
      }
      get_branches_public: {
        Args: never
        Returns: {
          address: string
          code: string
          created_at: string
          email: string
          head_name: string
          head_photo_url: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          phone: string
          sort_order: number
          total_students: number
          total_teachers: number
          website: string
        }[]
      }
      get_students_public: {
        Args: never
        Returns: {
          branch_id: string
          class_name: string
          id: string
          is_active: boolean
          name: string
          photo_url: string
          registration_number: string
          roll_number: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
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
