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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
          status: string
          updated_at: string
        }
        Insert: {
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          reading_time_minutes: number | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      bundle_customizations: {
        Row: {
          animations_enabled: boolean
          border_radius: number
          bundle_id: string
          created_at: string
          custom_benefits: Json | null
          custom_css: string | null
          custom_hero_text: string | null
          gradients_enabled: boolean
          id: string
          layout_type: string
          shadows_enabled: boolean
          spacing: number
          theme: string
          updated_at: string
          visible_sections: Json
        }
        Insert: {
          animations_enabled?: boolean
          border_radius?: number
          bundle_id: string
          created_at?: string
          custom_benefits?: Json | null
          custom_css?: string | null
          custom_hero_text?: string | null
          gradients_enabled?: boolean
          id?: string
          layout_type?: string
          shadows_enabled?: boolean
          spacing?: number
          theme?: string
          updated_at?: string
          visible_sections?: Json
        }
        Update: {
          animations_enabled?: boolean
          border_radius?: number
          bundle_id?: string
          created_at?: string
          custom_benefits?: Json | null
          custom_css?: string | null
          custom_hero_text?: string | null
          gradients_enabled?: boolean
          id?: string
          layout_type?: string
          shadows_enabled?: boolean
          spacing?: number
          theme?: string
          updated_at?: string
          visible_sections?: Json
        }
        Relationships: [
          {
            foreignKeyName: "bundle_customizations_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: true
            referencedRelation: "bundle_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_items: {
        Row: {
          bundle_id: string
          bundle_price: number
          created_at: string
          discount_percentage: number
          display_order: number
          id: string
          is_primary: boolean
          max_quantity: number | null
          min_quantity: number
          original_price: number
          product_id: string
          updated_at: string
        }
        Insert: {
          bundle_id: string
          bundle_price?: number
          created_at?: string
          discount_percentage?: number
          display_order?: number
          id?: string
          is_primary?: boolean
          max_quantity?: number | null
          min_quantity?: number
          original_price?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          bundle_id?: string
          bundle_price?: number
          created_at?: string
          discount_percentage?: number
          display_order?: number
          id?: string
          is_primary?: boolean
          max_quantity?: number | null
          min_quantity?: number
          original_price?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundle_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_offers: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      carriers: {
        Row: {
          code: string
          contact_info: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          responded_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          responded_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          responded_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          customer_id: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string | null
          state: string | null
          type: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          customer_id?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code?: string | null
          state?: string | null
          type: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          customer_id?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string | null
          state?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_clv: {
        Row: {
          avg_order_value: number
          churn_risk_score: number
          created_at: string
          current_clv: number
          customer_id: string
          first_order_date: string | null
          id: string
          last_order_date: string | null
          phone: string
          predicted_clv_12m: number
          predicted_clv_6m: number
          purchase_frequency: number
          segments: string[] | null
          total_orders: number
          updated_at: string
        }
        Insert: {
          avg_order_value?: number
          churn_risk_score?: number
          created_at?: string
          current_clv?: number
          customer_id: string
          first_order_date?: string | null
          id?: string
          last_order_date?: string | null
          phone: string
          predicted_clv_12m?: number
          predicted_clv_6m?: number
          purchase_frequency?: number
          segments?: string[] | null
          total_orders?: number
          updated_at?: string
        }
        Update: {
          avg_order_value?: number
          churn_risk_score?: number
          created_at?: string
          current_clv?: number
          customer_id?: string
          first_order_date?: string | null
          id?: string
          last_order_date?: string | null
          phone?: string
          predicted_clv_12m?: number
          predicted_clv_6m?: number
          purchase_frequency?: number
          segments?: string[] | null
          total_orders?: number
          updated_at?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          acquisition_source: string | null
          address: string | null
          avg_confirmation_time_min: number | null
          campaign: string | null
          cancelled_orders_cnt: number | null
          city: string | null
          confirmation_contactability_rate: number | null
          cookie_id: string | null
          created_at: string
          date_of_birth: string | null
          delivered_net_revenue_mad: number | null
          delivered_orders_cnt: number | null
          device_fingerprint: string | null
          email: string | null
          first_order_at: string | null
          first_touch: Json | null
          full_name: string
          gender: string | null
          gross_margin_mad: number | null
          id: string
          is_blocked: boolean | null
          is_vip: boolean | null
          last_order_at: string | null
          last_touch: Json | null
          marketing_opt_in: boolean | null
          marketing_source: string | null
          notes: string | null
          notes_blacklist: string[] | null
          phone: string
          risk_score: number | null
          rto_orders_cnt: number | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          whatsapp_opt_in: boolean | null
        }
        Insert: {
          acquisition_source?: string | null
          address?: string | null
          avg_confirmation_time_min?: number | null
          campaign?: string | null
          cancelled_orders_cnt?: number | null
          city?: string | null
          confirmation_contactability_rate?: number | null
          cookie_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          delivered_net_revenue_mad?: number | null
          delivered_orders_cnt?: number | null
          device_fingerprint?: string | null
          email?: string | null
          first_order_at?: string | null
          first_touch?: Json | null
          full_name: string
          gender?: string | null
          gross_margin_mad?: number | null
          id?: string
          is_blocked?: boolean | null
          is_vip?: boolean | null
          last_order_at?: string | null
          last_touch?: Json | null
          marketing_opt_in?: boolean | null
          marketing_source?: string | null
          notes?: string | null
          notes_blacklist?: string[] | null
          phone: string
          risk_score?: number | null
          rto_orders_cnt?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          whatsapp_opt_in?: boolean | null
        }
        Update: {
          acquisition_source?: string | null
          address?: string | null
          avg_confirmation_time_min?: number | null
          campaign?: string | null
          cancelled_orders_cnt?: number | null
          city?: string | null
          confirmation_contactability_rate?: number | null
          cookie_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          delivered_net_revenue_mad?: number | null
          delivered_orders_cnt?: number | null
          device_fingerprint?: string | null
          email?: string | null
          first_order_at?: string | null
          first_touch?: Json | null
          full_name?: string
          gender?: string | null
          gross_margin_mad?: number | null
          id?: string
          is_blocked?: boolean | null
          is_vip?: boolean | null
          last_order_at?: string | null
          last_touch?: Json | null
          marketing_opt_in?: boolean | null
          marketing_source?: string | null
          notes?: string | null
          notes_blacklist?: string[] | null
          phone?: string
          risk_score?: number | null
          rto_orders_cnt?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          whatsapp_opt_in?: boolean | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string | null
          description: string | null
          id: string
          order_id: string | null
          payment_method: string | null
          processed_at: string | null
          reference_number: string | null
          status: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          incoming: number
          location: string | null
          min_stock_level: number
          reserved: number
          stock_on_hand: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          incoming?: number
          location?: string | null
          min_stock_level?: number
          reserved?: number
          stock_on_hand?: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          incoming?: number
          location?: string | null
          min_stock_level?: number
          reserved?: number
          stock_on_hand?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          currency: string
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          adresse: string | null
          cart_items: Json | null
          converted_to_order_id: string | null
          created_at: string
          form_completion_percentage: number | null
          id: string
          last_activity: string
          nom: string | null
          phone: string | null
          status: string
          total_value: number | null
          updated_at: string
          utm_source: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          cart_items?: Json | null
          converted_to_order_id?: string | null
          created_at?: string
          form_completion_percentage?: number | null
          id?: string
          last_activity?: string
          nom?: string | null
          phone?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          utm_source?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          cart_items?: Json | null
          converted_to_order_id?: string | null
          created_at?: string
          form_completion_percentage?: number | null
          id?: string
          last_activity?: string
          nom?: string | null
          phone?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          utm_source?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          category: string | null
          cogs_per_unit: number | null
          id: number
          order_id: string
          product_id: string | null
          product_nom: string
          product_prix: number
          quantite: number
          unit_price: number | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          cogs_per_unit?: number | null
          id?: number
          order_id: string
          product_id?: string | null
          product_nom: string
          product_prix: number
          quantite: number
          unit_price?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          cogs_per_unit?: number | null
          id?: number
          order_id?: string
          product_id?: string | null
          product_nom?: string
          product_prix?: number
          quantite?: number
          unit_price?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          canceled_at: string | null
          city: string | null
          client_adresse: string
          client_nom: string
          client_phone: string
          client_ville: string
          cod_fee: number | null
          code_suivi: string
          cogs_total: number | null
          confirmed_at: string | null
          courier: string | null
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          discount_total: number | null
          first_name: string | null
          id: string
          lang: string | null
          marketing_cost: number | null
          order_total: number
          packed_at: string | null
          phone_e164: string | null
          region: string | null
          returned_at: string | null
          shipped_at: string | null
          shipping_cost: number | null
          source_channel: string | null
          status: string | null
          total_mad: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp_confirm_at: string | null
          whatsapp_confirm_sent: boolean | null
        }
        Insert: {
          canceled_at?: string | null
          city?: string | null
          client_adresse: string
          client_nom: string
          client_phone: string
          client_ville: string
          cod_fee?: number | null
          code_suivi?: string
          cogs_total?: number | null
          confirmed_at?: string | null
          courier?: string | null
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          discount_total?: number | null
          first_name?: string | null
          id?: string
          lang?: string | null
          marketing_cost?: number | null
          order_total?: number
          packed_at?: string | null
          phone_e164?: string | null
          region?: string | null
          returned_at?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          source_channel?: string | null
          status?: string | null
          total_mad?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp_confirm_at?: string | null
          whatsapp_confirm_sent?: boolean | null
        }
        Update: {
          canceled_at?: string | null
          city?: string | null
          client_adresse?: string
          client_nom?: string
          client_phone?: string
          client_ville?: string
          cod_fee?: number | null
          code_suivi?: string
          cogs_total?: number | null
          confirmed_at?: string | null
          courier?: string | null
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          discount_total?: number | null
          first_name?: string | null
          id?: string
          lang?: string | null
          marketing_cost?: number | null
          order_total?: number
          packed_at?: string | null
          phone_e164?: string | null
          region?: string | null
          returned_at?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          source_channel?: string | null
          status?: string | null
          total_mad?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp_confirm_at?: string | null
          whatsapp_confirm_sent?: boolean | null
        }
        Relationships: []
      }
      product_relationships: {
        Row: {
          created_at: string
          display_order: number
          id: string
          product_id: string
          related_product_id: string
          relationship_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          product_id: string
          related_product_id: string
          relationship_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          product_id?: string
          related_product_id?: string
          relationship_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_relationships_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_product_relationships_related_product_id"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          is_approved: boolean
          is_verified: boolean
          product_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          product_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          product_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          cost: number
          created_at: string
          dimensions: Json | null
          id: string
          name: string
          price: number
          product_id: string | null
          sku: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          cost?: number
          created_at?: string
          dimensions?: Json | null
          id?: string
          name: string
          price?: number
          product_id?: string | null
          sku: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          cost?: number
          created_at?: string
          dimensions?: Json | null
          id?: string
          name?: string
          price?: number
          product_id?: string | null
          sku?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          en_stock: boolean
          id: string
          media: Json
          model_url: string | null
          nom: string
          prix: number
          slug: string
          variables: Json | null
          weight_kg: number | null
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          en_stock?: boolean
          id?: string
          media?: Json
          model_url?: string | null
          nom: string
          prix: number
          slug: string
          variables?: Json | null
          weight_kg?: number | null
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          en_stock?: boolean
          id?: string
          media?: Json
          model_url?: string | null
          nom?: string
          prix?: number
          slug?: string
          variables?: Json | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      return_items: {
        Row: {
          condition: string | null
          created_at: string
          id: string
          notes: string | null
          product_id: string | null
          quantity: number
          return_id: string | null
          variant_id: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity: number
          return_id?: string | null
          variant_id?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          return_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          created_at: string
          customer_id: string | null
          handling_cost: number | null
          id: string
          order_id: string | null
          processed_at: string | null
          reason_code: string
          reason_description: string | null
          received_at: string | null
          refund_amount: number | null
          restocking_decision: string | null
          return_code: string
          return_type: string
          return_value: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          handling_cost?: number | null
          id?: string
          order_id?: string | null
          processed_at?: string | null
          reason_code: string
          reason_description?: string | null
          received_at?: string | null
          refund_amount?: number | null
          restocking_decision?: string | null
          return_code: string
          return_type: string
          return_value?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          handling_cost?: number | null
          id?: string
          order_id?: string | null
          processed_at?: string | null
          reason_code?: string
          reason_description?: string | null
          received_at?: string | null
          refund_amount?: number | null
          restocking_decision?: string | null
          return_code?: string
          return_type?: string
          return_value?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_forecasts: {
        Row: {
          category_id: string | null
          confidence_level: number
          created_at: string
          forecast_date: string
          id: string
          model_version: string | null
          period_type: string
          predicted_orders: number
          predicted_revenue: number
          product_id: string | null
          seasonal_factor: number
          trend_factor: number
        }
        Insert: {
          category_id?: string | null
          confidence_level?: number
          created_at?: string
          forecast_date: string
          id?: string
          model_version?: string | null
          period_type: string
          predicted_orders?: number
          predicted_revenue?: number
          product_id?: string | null
          seasonal_factor?: number
          trend_factor?: number
        }
        Update: {
          category_id?: string | null
          confidence_level?: number
          created_at?: string
          forecast_date?: string
          id?: string
          model_version?: string | null
          period_type?: string
          predicted_orders?: number
          predicted_revenue?: number
          product_id?: string | null
          seasonal_factor?: number
          trend_factor?: number
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          is_active: boolean
          meta_robots: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_name: string
          page_path: string
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          structured_data: Json | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meta_robots?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name: string
          page_path: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          structured_data?: Json | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meta_robots?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name?: string
          page_path?: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          structured_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          base_cost: number
          carrier_id: string | null
          cities: string[] | null
          created_at: string
          delivery_time_max: number | null
          delivery_time_min: number | null
          id: string
          is_active: boolean | null
          per_kg_cost: number | null
          zone_name: string
        }
        Insert: {
          base_cost?: number
          carrier_id?: string | null
          cities?: string[] | null
          created_at?: string
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          id?: string
          is_active?: boolean | null
          per_kg_cost?: number | null
          zone_name: string
        }
        Update: {
          base_cost?: number
          carrier_id?: string | null
          cities?: string[] | null
          created_at?: string
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          id?: string
          is_active?: boolean | null
          per_kg_cost?: number | null
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zones_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      social_metrics: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          metric_date: string
          metric_type: string
          metric_value: number
          platform: string
          post_id: string | null
          utm_campaign: string | null
          utm_source: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          metric_date: string
          metric_type: string
          metric_value?: number
          platform: string
          post_id?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
          platform?: string
          post_id?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      status_events: {
        Row: {
          created_at: string
          from_status: string | null
          id: string
          notes: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          created_at?: string
          from_status?: string | null
          id?: string
          notes?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          created_at?: string
          from_status?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          quantity: number
          reason: string | null
          reference_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      whatsapp_logs: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          direction: string | null
          error_text: string | null
          id: string
          locale: string | null
          order_id: string | null
          payload: Json | null
          phone_e164: string | null
          response_body: Json | null
          response_status: number | null
          template_name: string | null
          wa_message_id: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          direction?: string | null
          error_text?: string | null
          id?: string
          locale?: string | null
          order_id?: string | null
          payload?: Json | null
          phone_e164?: string | null
          response_body?: Json | null
          response_status?: number | null
          template_name?: string | null
          wa_message_id?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          direction?: string | null
          error_text?: string | null
          id?: string
          locale?: string | null
          order_id?: string | null
          payload?: Json | null
          phone_e164?: string | null
          response_body?: Json | null
          response_status?: number | null
          template_name?: string | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_funnel_counts: {
        Row: {
          annulee: number | null
          confirmee: number | null
          d: string | null
          en_preparation: number | null
          expediee: number | null
          livree: number | null
          nouvelle: number | null
          retournee: number | null
        }
        Relationships: []
      }
      v_overview_daily: {
        Row: {
          d: string | null
          delivered_aov: number | null
          delivered_orders: number | null
          delivered_revenue: number | null
          total_gmv: number | null
          total_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_customer_clv: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_return_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_order_by_tracking: {
        Args: { p_code: string }
        Returns: {
          code_suivi: string
          created_at: string
          items: Json
          statut: string
        }[]
      }
      get_product_rating_stats: {
        Args: { p_product_id: string }
        Returns: {
          average_rating: number
          rating_distribution: Json
          total_reviews: number
        }[]
      }
      get_related_blog_posts: {
        Args: { p_limit?: number; p_post_id: string }
        Returns: {
          excerpt: string
          featured_image: string
          id: string
          published_at: string
          slug: string
          title: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_whatsapp_logs: {
        Args: {
          p_direction?: string
          p_from_date?: string
          p_limit?: number
          p_offset?: number
          p_phone?: string
          p_to_date?: string
        }
        Returns: {
          attempt_count: number
          created_at: string
          direction: string
          error_text: string
          id: string
          locale: string
          order_code: string
          order_id: string
          phone_e164: string
          response_status: number
          template_name: string
          wa_message_id: string
        }[]
      }
      get_whatsapp_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          setting_key: string
          setting_value: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_post_views: {
        Args: { post_id: string }
        Returns: undefined
      }
      make_tracking_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      place_order: {
        Args: { p_client: Json; p_items: Json }
        Returns: {
          code_suivi: string
          order_id: string
        }[]
      }
      rpc_analytics_clv: {
        Args: { from_ts: string; to_ts: string }
        Returns: {
          avg_clv: number
          churn_risk_customers: number
          high_value_customers: number
          predicted_revenue_12m: number
          predicted_revenue_6m: number
          total_customers: number
        }[]
      }
      rpc_analytics_geo: {
        Args: { filters?: Json; from_ts: string; to_ts: string }
        Returns: {
          city: string
          courier: string
          delivered_orders: number
          delivered_revenue: number
          delivery_rate: number
          shipping_cost_per_delivered: number
          transit_p90_days: number
        }[]
      }
      rpc_analytics_marketing: {
        Args: { filters?: Json; from_ts: string; to_ts: string }
        Returns: {
          campaign: string
          delivered_aov: number
          delivered_orders: number
          delivered_rate: number
          delivered_revenue: number
          rto_rate: number
          source: string
        }[]
      }
      rpc_analytics_overview: {
        Args: { filters?: Json; from_ts: string; to_ts: string }
        Returns: {
          attempted_gmv: number
          cancel_rate: number
          contribution: number
          contribution_pct: number
          delivered_aov: number
          delivered_orders: number
          delivered_revenue: number
          delivery_rate: number
          rto_rate: number
        }[]
      }
      rpc_analytics_products: {
        Args: { filters?: Json; from_ts: string; to_ts: string }
        Returns: {
          aov_contrib: number
          cancel_rate: number
          category: string
          delivered_revenue: number
          delivered_units: number
          product_id: string
          product_name: string
          return_rate: number
          sku_margin: number
        }[]
      }
      rpc_analytics_profit_margins: {
        Args: { from_ts: string; to_ts: string }
        Returns: {
          avg_selling_price: number
          category: string
          cost_of_goods: number
          gross_profit: number
          gross_revenue: number
          product_id: string
          product_name: string
          profit_margin_pct: number
          units_sold: number
        }[]
      }
      rpc_analytics_sla: {
        Args: { filters?: Json; from_ts: string; to_ts: string }
        Returns: {
          t_confirm_p50: number
          t_confirm_p90: number
          t_o2d_p50: number
          t_o2d_p90: number
          t_pack_p50: number
          t_pack_p90: number
          t_ship_p50: number
          t_ship_p90: number
          t_transit_p50: number
          t_transit_p90: number
        }[]
      }
      update_customer_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_whatsapp_setting: {
        Args: { p_key: string; p_value: string }
        Returns: undefined
      }
      verify_and_approve_review: {
        Args: { p_phone: string; p_product_id: string; p_review_id: string }
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
