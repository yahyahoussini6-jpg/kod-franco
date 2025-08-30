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
