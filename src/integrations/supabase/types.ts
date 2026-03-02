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
      ad_pricing: {
        Row: {
          created_at: string
          description: string | null
          dimensions: string | null
          id: string
          is_active: boolean | null
          price_monthly: number | null
          price_yearly: number | null
          slot_key: string
          slot_name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          price_monthly?: number | null
          price_yearly?: number | null
          slot_key: string
          slot_name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          price_monthly?: number | null
          price_yearly?: number | null
          slot_key?: string
          slot_name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          role_name: string
          section_key: string
          updated_at: string
        }
        Insert: {
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          role_name: string
          section_key: string
          updated_at?: string
        }
        Update: {
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          role_name?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      book_order_items: {
        Row: {
          book_id: string
          created_at: string
          id: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_order_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "book_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      book_orders: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          delivery_charge: number
          district: string | null
          email: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          phone: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string
          customer_name: string
          delivery_charge?: number
          district?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string
          phone: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          delivery_charge?: number
          district?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          phone?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      book_reviews: {
        Row: {
          book_id: string
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          rating: number
          reviewer_name: string
        }
        Insert: {
          book_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating: number
          reviewer_name: string
        }
        Update: {
          book_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_name: string
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          isbn: string | null
          language: string | null
          pages: number | null
          preview_pdf_url: string | null
          price: number
          publisher: string | null
          slug: string
          sort_order: number | null
          stock: number | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          isbn?: string | null
          language?: string | null
          pages?: number | null
          preview_pdf_url?: string | null
          price?: number
          publisher?: string | null
          slug: string
          sort_order?: number | null
          stock?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          isbn?: string | null
          language?: string | null
          pages?: number | null
          preview_pdf_url?: string | null
          price?: number
          publisher?: string | null
          slug?: string
          sort_order?: number | null
          stock?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          description: string | null
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
          description?: string | null
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
          description?: string | null
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
          admin_reply: string | null
          created_at: string
          email: string | null
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          subject: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      customer_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          replied_at: string | null
          subject: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          replied_at?: string | null
          subject: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          replied_at?: string | null
          subject?: string
          user_id?: string
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
      gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      institutions: {
        Row: {
          address: string | null
          admin_note: string | null
          approval_letter_url: string | null
          classes: string | null
          created_at: string
          departments: string | null
          description: string | null
          district: string | null
          email: string | null
          id: string
          logo_url: string | null
          muhtamim_name: string | null
          muhtamim_photo_url: string | null
          name: string
          phone: string
          registration_cert_url: string | null
          status: string
          subscription_plan: string | null
          total_students: number | null
          total_teachers: number | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_note?: string | null
          approval_letter_url?: string | null
          classes?: string | null
          created_at?: string
          departments?: string | null
          description?: string | null
          district?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          muhtamim_name?: string | null
          muhtamim_photo_url?: string | null
          name: string
          phone: string
          registration_cert_url?: string | null
          status?: string
          subscription_plan?: string | null
          total_students?: number | null
          total_teachers?: number | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_note?: string | null
          approval_letter_url?: string | null
          classes?: string | null
          created_at?: string
          departments?: string | null
          description?: string | null
          district?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          muhtamim_name?: string | null
          muhtamim_photo_url?: string | null
          name?: string
          phone?: string
          registration_cert_url?: string | null
          status?: string
          subscription_plan?: string | null
          total_students?: number | null
          total_teachers?: number | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      islamic_contents: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          meaning: string | null
          question: string | null
          reference: string | null
          sort_order: number | null
          source: string | null
          subcategory: string | null
          title: string
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          meaning?: string | null
          question?: string | null
          reference?: string | null
          sort_order?: number | null
          source?: string | null
          subcategory?: string | null
          title: string
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          meaning?: string | null
          question?: string | null
          reference?: string | null
          sort_order?: number | null
          source?: string | null
          subcategory?: string | null
          title?: string
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          branch_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          experience_required: string | null
          id: string
          is_active: boolean | null
          location: string | null
          qualification_required: string | null
          salary_range: string | null
          sort_order: number | null
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          experience_required?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          qualification_required?: string | null
          salary_range?: string | null
          sort_order?: number | null
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          experience_required?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          qualification_required?: string | null
          salary_range?: string | null
          sort_order?: number | null
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
          branch_id: string | null
          content: string | null
          created_at: string
          id: string
          is_active: boolean | null
          signature_url: string | null
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          signature_url?: string | null
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          signature_url?: string | null
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
          cover_image_url: string | null
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_image_url?: string | null
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
          image_caption: string | null
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          slug: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_caption?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_caption?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          slug?: string
          summary?: string | null
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
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          district: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      quiz_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      quiz_levels: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          required_score: number | null
          sort_order: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          required_score?: number | null
          sort_order?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          required_score?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_levels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string
          explanation: string | null
          id: string
          is_active: boolean | null
          level_id: string
          options: Json
          points: number | null
          question: string
          question_type: string
          sort_order: number | null
        }
        Insert: {
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          level_id: string
          options?: Json
          points?: number | null
          question: string
          question_type?: string
          sort_order?: number | null
        }
        Update: {
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          level_id?: string
          options?: Json
          points?: number | null
          question?: string
          question_type?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "quiz_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_user_progress: {
        Row: {
          attempts: number | null
          best_score: number | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string
          id: string
          is_completed: boolean | null
          level_id: string
          score: number | null
          total_questions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_score?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          level_id: string
          score?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_score?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          level_id?: string
          score?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_user_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "quiz_levels"
            referencedColumns: ["id"]
          },
        ]
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
      sliders: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
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
      teacher_applications: {
        Row: {
          address: string | null
          admin_note: string | null
          bio: string | null
          certification: string | null
          created_at: string
          cv_url: string | null
          district: string | null
          email: string | null
          expected_salary: string | null
          experience_years: number | null
          id: string
          name: string
          nid_image_url: string | null
          phone: string
          photo_url: string | null
          preferred_area: string | null
          qualification: string | null
          reference_name: string | null
          reference_phone: string | null
          specialization: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
          verification_video_url: string | null
        }
        Insert: {
          address?: string | null
          admin_note?: string | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          cv_url?: string | null
          district?: string | null
          email?: string | null
          expected_salary?: string | null
          experience_years?: number | null
          id?: string
          name: string
          nid_image_url?: string | null
          phone: string
          photo_url?: string | null
          preferred_area?: string | null
          qualification?: string | null
          reference_name?: string | null
          reference_phone?: string | null
          specialization?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
          verification_video_url?: string | null
        }
        Update: {
          address?: string | null
          admin_note?: string | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          cv_url?: string | null
          district?: string | null
          email?: string | null
          expected_salary?: string | null
          experience_years?: number | null
          id?: string
          name?: string
          nid_image_url?: string | null
          phone?: string
          photo_url?: string | null
          preferred_area?: string | null
          qualification?: string | null
          reference_name?: string | null
          reference_phone?: string | null
          specialization?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
          verification_video_url?: string | null
        }
        Relationships: []
      }
      teacher_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          institution_name: string | null
          is_approved: boolean | null
          rating: number
          reviewer_name: string
          teacher_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          institution_name?: string | null
          is_approved?: boolean | null
          rating: number
          reviewer_name: string
          teacher_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          institution_name?: string | null
          is_approved?: boolean | null
          rating?: number
          reviewer_name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          bio: string | null
          certification: string | null
          created_at: string
          district: string | null
          email: string | null
          exam_result: string | null
          expected_salary: string | null
          experience_years: number | null
          grade_obtained: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          is_verified: boolean | null
          name: string
          phone: string | null
          photo_url: string | null
          preferred_area: string | null
          previous_institution: string | null
          qualification: string | null
          rating: number | null
          sort_order: number | null
          specialization: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          exam_result?: string | null
          expected_salary?: string | null
          experience_years?: number | null
          grade_obtained?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          is_verified?: boolean | null
          name: string
          phone?: string | null
          photo_url?: string | null
          preferred_area?: string | null
          previous_institution?: string | null
          qualification?: string | null
          rating?: number | null
          sort_order?: number | null
          specialization?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          exam_result?: string | null
          expected_salary?: string | null
          experience_years?: number | null
          grade_obtained?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          is_verified?: boolean | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          preferred_area?: string | null
          previous_institution?: string | null
          qualification?: string | null
          rating?: number | null
          sort_order?: number | null
          specialization?: string | null
          subject?: string
          updated_at?: string
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
          description: string
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
      get_student_details_for_result: {
        Args: { p_student_id: string }
        Returns: {
          address: string
          father_name: string
          mother_name: string
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
      has_any_role: { Args: never; Returns: boolean }
      has_section_permission: {
        Args: { p_action: string; p_section: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator" | "editor"
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
      app_role: ["admin", "user", "moderator", "editor"],
    },
  },
} as const
