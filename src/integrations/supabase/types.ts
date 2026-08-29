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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_settings: {
        Row: {
          cash_baseline_at: string
          cash_baseline_cents: number
          created_at: string
          id: number
          reporting_start_at: string
          updated_at: string
        }
        Insert: {
          cash_baseline_at: string
          cash_baseline_cents?: number
          created_at?: string
          id: number
          reporting_start_at: string
          updated_at?: string
        }
        Update: {
          cash_baseline_at?: string
          cash_baseline_cents?: number
          created_at?: string
          id?: number
          reporting_start_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_reserves: {
        Row: {
          account: string | null
          amount_cents: number
          created_at: string
          id: string
          name: string
          notes: string | null
          released_at: string | null
          status: string
        }
        Insert: {
          account?: string | null
          amount_cents: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          released_at?: string | null
          status?: string
        }
        Update: {
          account?: string | null
          amount_cents?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          released_at?: string | null
          status?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          account: string | null
          account_scope: string
          amount_cents: number
          cash_status: string
          category: string | null
          created_at: string
          description: string
          id: string
          metadata: Json
          occurred_at: string
          order_id: string | null
          settlement_status: string
          source: string | null
          type: string
        }
        Insert: {
          account?: string | null
          account_scope?: string
          amount_cents: number
          cash_status?: string
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          order_id?: string | null
          settlement_status?: string
          source?: string | null
          type: string
        }
        Update: {
          account?: string | null
          account_scope?: string
          amount_cents?: number
          cash_status?: string
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          order_id?: string | null
          settlement_status?: string
          source?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_availability: {
        Row: {
          available: boolean
          entity_id: string
          entity_type: string
          updated_at: string
        }
        Insert: {
          available: boolean
          entity_id: string
          entity_type: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          entity_id?: string
          entity_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total_cents: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          selections: Json
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_cents: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          selections?: Json
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total_cents?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          selections?: Json
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          apartment: string | null
          block: string | null
          checkout_token: string
          created_at: string
          customer_name: string
          customer_whatsapp: string | null
          fulfillment_type: string
          id: string
          notes: string | null
          order_number: number
          status: string
          subtotal_cents: number
          unit_key: string | null
        }
        Insert: {
          apartment?: string | null
          block?: string | null
          checkout_token: string
          created_at?: string
          customer_name: string
          customer_whatsapp?: string | null
          fulfillment_type?: string
          id?: string
          notes?: string | null
          order_number?: number
          status?: string
          subtotal_cents: number
          unit_key?: string | null
        }
        Update: {
          apartment?: string | null
          block?: string | null
          checkout_token?: string
          created_at?: string
          customer_name?: string
          customer_whatsapp?: string | null
          fulfillment_type?: string
          id?: string
          notes?: string | null
          order_number?: number
          status?: string
          subtotal_cents?: number
          unit_key?: string | null
        }
        Relationships: []
      }
      packaging_inventory: {
        Row: {
          cups_count: number
          lids_count: number
          notes: string | null
          size_ml: number
          updated_at: string
        }
        Insert: {
          cups_count?: number
          lids_count?: number
          notes?: string | null
          size_ml: number
          updated_at?: string
        }
        Update: {
          cups_count?: number
          lids_count?: number
          notes?: string | null
          size_ml?: number
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
