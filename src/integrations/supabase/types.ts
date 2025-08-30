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
      customer_profiles: {
        Row: {
          acquisition_source: string | null
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          is_blocked: boolean | null
          is_vip: boolean | null
          marketing_opt_in: boolean | null
          notes: string | null
          phone: string
          risk_score: number | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          whatsapp_opt_in: boolean | null
        }
        Insert: {
          acquisition_source?: string | null
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          is_blocked?: boolean | null
          is_vip?: boolean | null
          marketing_opt_in?: boolean | null
          notes?: string | null
          phone: string
          risk_score?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          whatsapp_opt_in?: boolean | null
        }
        Update: {
          acquisition_source?: string | null
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_blocked?: boolean | null
          is_vip?: boolean | null
          marketing_opt_in?: boolean | null
          notes?: string | null
          phone?: string
          risk_score?: number | null
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
          id: string
          order_total: number
          packed_at: string | null
          region: string | null
          returned_at: string | null
          shipped_at: string | null
          shipping_cost: number | null
          source_channel: string | null
          status: string | null
          utm_campaign: string | null
          utm_source: string | null
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
          id?: string
          order_total?: number
          packed_at?: string | null
          region?: string | null
          returned_at?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          source_channel?: string | null
          status?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
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
          id?: string
          order_total?: number
          packed_at?: string | null
          region?: string | null
          returned_at?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          source_channel?: string | null
          status?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
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
        }
        Insert: {
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
        }
        Update: {
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
        }
        Relationships: []
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
      get_order_by_tracking: {
        Args: { p_code: string }
        Returns: {
          code_suivi: string
          created_at: string
          items: Json
          statut: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
