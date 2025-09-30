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
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          booking_ids: string[] | null
          created_at: string | null
          id: string
          listing_id: string
          unavailable_dates: Json | null
          updated_at: string | null
        }
        Insert: {
          booking_ids?: string[] | null
          created_at?: string | null
          id?: string
          listing_id: string
          unavailable_dates?: Json | null
          updated_at?: string | null
        }
        Update: {
          booking_ids?: string[] | null
          created_at?: string | null
          id?: string
          listing_id?: string
          unavailable_dates?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          id: string
          item_status: Database["public"]["Enums"]["item_status"] | null
          listing_id: string
          owner_id: string
          price_per_day: number
          rental_end_date: string
          rental_start_date: string
          renter_id: string
          requested_at: string | null
          service_fee: number
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          taxes: number
          total_days: number
          total_price: number
          updated_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          item_status?: Database["public"]["Enums"]["item_status"] | null
          listing_id: string
          owner_id: string
          price_per_day: number
          rental_end_date: string
          rental_start_date: string
          renter_id: string
          requested_at?: string | null
          service_fee: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          taxes: number
          total_days: number
          total_price: number
          updated_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          item_status?: Database["public"]["Enums"]["item_status"] | null
          listing_id?: string
          owner_id?: string
          price_per_day?: number
          rental_end_date?: string
          rental_start_date?: string
          renter_id?: string
          requested_at?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          taxes?: number
          total_days?: number
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          owner_id: string
          renter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          owner_id: string
          renter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          owner_id?: string
          renter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kits_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kits_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kits_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          add_ons: Json | null
          block_out_times: Json | null
          booking_count: number | null
          bulk_pricing: Json | null
          business_license_verified: boolean | null
          categories: Database["public"]["Enums"]["listing_category"][]
          created_at: string | null
          delivery_available: boolean | null
          delivery_fee: number | null
          delivery_radius: number | null
          deposit_amount: number | null
          description: string | null
          discount_rate_month: number | null
          discount_rate_week: number | null
          featured: boolean | null
          id: string
          insurance_required: boolean | null
          inventory_count: number | null
          is_available: boolean | null
          listing_status: string | null
          location_lat: number | null
          location_lng: number | null
          max_rental_days: number | null
          min_rental_days: number | null
          multiplier: number | null
          owner_id: string
          photos: string[] | null
          pickup_addresses: string[] | null
          pickup_instructions: string | null
          price_per_day: number
          rented_as_kit: boolean | null
          rules_and_requirements: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          add_ons?: Json | null
          block_out_times?: Json | null
          booking_count?: number | null
          bulk_pricing?: Json | null
          business_license_verified?: boolean | null
          categories: Database["public"]["Enums"]["listing_category"][]
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          deposit_amount?: number | null
          description?: string | null
          discount_rate_month?: number | null
          discount_rate_week?: number | null
          featured?: boolean | null
          id?: string
          insurance_required?: boolean | null
          inventory_count?: number | null
          is_available?: boolean | null
          listing_status?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_rental_days?: number | null
          min_rental_days?: number | null
          multiplier?: number | null
          owner_id: string
          photos?: string[] | null
          pickup_addresses?: string[] | null
          pickup_instructions?: string | null
          price_per_day: number
          rented_as_kit?: boolean | null
          rules_and_requirements?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          add_ons?: Json | null
          block_out_times?: Json | null
          booking_count?: number | null
          bulk_pricing?: Json | null
          business_license_verified?: boolean | null
          categories?: Database["public"]["Enums"]["listing_category"][]
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          deposit_amount?: number | null
          description?: string | null
          discount_rate_month?: number | null
          discount_rate_week?: number | null
          featured?: boolean | null
          id?: string
          insurance_required?: boolean | null
          inventory_count?: number | null
          is_available?: boolean | null
          listing_status?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_rental_days?: number | null
          min_rental_days?: number | null
          multiplier?: number | null
          owner_id?: string
          photos?: string[] | null
          pickup_addresses?: string[] | null
          pickup_instructions?: string | null
          price_per_day?: number
          rented_as_kit?: boolean | null
          rules_and_requirements?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment_listing: string | null
          comment_owner: string | null
          comment_renter: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          listing_rating: number | null
          owner_rating: number | null
          renter_rating: number | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          comment_listing?: string | null
          comment_owner?: string | null
          comment_renter?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          listing_rating?: number | null
          owner_rating?: number | null
          renter_rating?: number | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          comment_listing?: string | null
          comment_owner?: string | null
          comment_renter?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          listing_rating?: number | null
          owner_rating?: number | null
          renter_rating?: number | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_favorites_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_favorites_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_financial_data: {
        Row: {
          account_number: string | null
          created_at: string
          government_id_image: string | null
          id: string
          institution_number: string | null
          payment_method_ids: string[] | null
          payout_method_id: string | null
          tax_id: string | null
          transit_number: string | null
          updated_at: string
          user_id: string
          void_cheque: string | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          government_id_image?: string | null
          id?: string
          institution_number?: string | null
          payment_method_ids?: string[] | null
          payout_method_id?: string | null
          tax_id?: string | null
          transit_number?: string | null
          updated_at?: string
          user_id: string
          void_cheque?: string | null
        }
        Update: {
          account_number?: string | null
          created_at?: string
          government_id_image?: string | null
          id?: string
          institution_number?: string | null
          payment_method_ids?: string[] | null
          payout_method_id?: string | null
          tax_id?: string | null
          transit_number?: string | null
          updated_at?: string
          user_id?: string
          void_cheque?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_financial_data_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          business_license: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_verified: boolean | null
          last_name: string
          location_address: string | null
          password_hash: string
          phone_number: string | null
          postal_code: string | null
          profile_bio: string | null
          profile_image_url: string | null
          state_province: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          auth_user_id?: string | null
          business_license?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          is_verified?: boolean | null
          last_name: string
          location_address?: string | null
          password_hash: string
          phone_number?: string | null
          postal_code?: string | null
          profile_bio?: string | null
          profile_image_url?: string | null
          state_province?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          auth_user_id?: string | null
          business_license?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_verified?: boolean | null
          last_name?: string
          location_address?: string | null
          password_hash?: string
          phone_number?: string | null
          postal_code?: string | null
          profile_bio?: string | null
          profile_image_url?: string | null
          state_province?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_listing: {
        Args: { listing_id: string }
        Returns: boolean
      }
      get_listing_for_booking: {
        Args: { listing_id: string }
        Returns: {
          add_ons: Json
          bulk_pricing: Json
          categories: string[]
          delivery_available: boolean
          delivery_fee: number
          delivery_radius: number
          deposit_amount: number
          description: string
          id: string
          insurance_required: boolean
          inventory_count: number
          location_lat: number
          location_lng: number
          max_rental_days: number
          min_rental_days: number
          photos: string[]
          pickup_instructions: string
          price_per_day: number
          rented_as_kit: boolean
          rules_and_requirements: string
          title: string
        }[]
      }
      get_listing_for_owner: {
        Args: { listing_id: string }
        Returns: {
          add_ons: Json
          categories: string[]
          created_at: string
          delivery_available: boolean
          delivery_fee: number
          deposit_amount: number
          description: string
          id: string
          insurance_required: boolean
          is_available: boolean
          listing_status: string
          max_rental_days: number
          min_rental_days: number
          owner_id: string
          photos: string[]
          pickup_addresses: string[]
          pickup_instructions: string
          price_per_day: number
          rules_and_requirements: string
          title: string
          updated_at: string
        }[]
      }
      get_public_listings: {
        Args: Record<PropertyKey, never>
        Returns: {
          categories: string[]
          created_at: string
          delivery_available: boolean
          description: string
          featured: boolean
          id: string
          inventory_count: number
          location_lat: number
          location_lng: number
          max_rental_days: number
          min_rental_days: number
          photos: string[]
          price_per_day: number
          title: string
          view_count: number
        }[]
      }
    }
    Enums: {
      booking_status:
        | "pending_approval"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled_by_renter"
        | "cancelled_by_owner"
        | "disputed"
      item_status: "available" | "unavailable"
      listing_category:
        | "camping"
        | "water_sports"
        | "climbing"
        | "vehicles"
        | "winter_sports"
        | "hiking"
        | "cycling"
      user_type: "individual" | "business"
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
      booking_status: [
        "pending_approval",
        "confirmed",
        "active",
        "completed",
        "cancelled_by_renter",
        "cancelled_by_owner",
        "disputed",
      ],
      item_status: ["available", "unavailable"],
      listing_category: [
        "camping",
        "water_sports",
        "climbing",
        "vehicles",
        "winter_sports",
        "hiking",
        "cycling",
      ],
      user_type: ["individual", "business"],
    },
  },
} as const
