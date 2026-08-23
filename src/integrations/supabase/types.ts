export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      finance_settings: {
        Row: {
          id: number
          reporting_start_at: string
          cash_baseline_at: string
          cash_baseline_cents: number
          updated_at: string
        }
        Insert: {
          id?: number
          reporting_start_at: string
          cash_baseline_at: string
          cash_baseline_cents: number
          updated_at?: string
        }
        Update: {
          id?: number
          reporting_start_at?: string
          cash_baseline_at?: string
          cash_baseline_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_reserves: {
        Row: {
          id: string
          name: string
          amount_cents: number
          status: string
          notes: string | null
          created_at: string
          released_at: string | null
          account: string | null
        }
        Insert: {
          id?: string
          name: string
          amount_cents: number
          status?: string
          notes?: string | null
          created_at?: string
          released_at?: string | null
          account?: string | null
        }
        Update: {
          id?: string
          name?: string
          amount_cents?: number
          status?: string
          notes?: string | null
          created_at?: string
          released_at?: string | null
          account?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          id: string
          occurred_at: string
          type: string
          amount_cents: number
          description: string
          category: string | null
          source: string | null
          order_id: string | null
          metadata: Json
          created_at: string
          account: string | null
          cash_status: string
          settlement_status: string
          settled_at: string | null
          account_scope: string
        }
        Insert: {
          id?: string
          occurred_at?: string
          type: string
          amount_cents: number
          description?: string
          category?: string | null
          source?: string | null
          order_id?: string | null
          metadata?: Json
          created_at?: string
          account?: string | null
          cash_status?: string
          settlement_status?: string
          settled_at?: string | null
          account_scope?: string
        }
        Update: {
          id?: string
          occurred_at?: string
          type?: string
          amount_cents?: number
          description?: string
          category?: string | null
          source?: string | null
          order_id?: string | null
          metadata?: Json
          created_at?: string
          account?: string | null
          cash_status?: string
          settlement_status?: string
          settled_at?: string | null
          account_scope?: string
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
      packaging_inventory: {
        Row: {
          size_ml: number
          cups_count: number
          lids_count: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          size_ml: number
          cups_count?: number
          lids_count?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          size_ml?: number
          cups_count?: number
          lids_count?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price_cents: number
          line_total_cents: number
          selections: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price_cents: number
          line_total_cents: number
          selections?: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price_cents?: number
          line_total_cents?: number
          selections?: Json
          created_at?: string
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
          id: string
          order_number: number
          checkout_token: string
          customer_name: string
          customer_whatsapp: string | null
          block: string | null
          apartment: string | null
          unit_key: string | null
          subtotal_cents: number
          status: string
          notes: string | null
          created_at: string
          fulfillment_type: string
        }
        Insert: {
          id?: string
          order_number?: number
          checkout_token: string
          customer_name: string
          customer_whatsapp?: string | null
          block?: string | null
          apartment?: string | null
          unit_key?: string | null
          subtotal_cents: number
          status?: string
          notes?: string | null
          created_at?: string
          fulfillment_type?: string
        }
        Update: {
          id?: string
          order_number?: number
          checkout_token?: string
          customer_name?: string
          customer_whatsapp?: string | null
          block?: string | null
          apartment?: string | null
          unit_key?: string | null
          subtotal_cents?: number
          status?: string
          notes?: string | null
          created_at?: string
          fulfillment_type?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = { public: { Enums: {} } } as const
