/**
 * builtwhilebroke.tech - Type Definitions
 *
 * Authoritative TypeScript types for:
 * - Supabase Database Schema (tables, views, functions, enums)
 * - Community Hack Submissions (PR & submission forms)
 * - Type-safe query helpers and API interfaces
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database Enums
export type AppType = 'web_app' | 'chrome_extension' | 'desktop_app';
export type ListingCategory = 'developer-tools' | 'productivity' | 'design' | 'utilities';
export type ListingStatus = 'draft' | 'active' | 'paused';
export type SlotType = 'header_pill' | 'empty_state' | 'footer_badge' | 'email_footer';
export type SponsorshipStatus = 'escrow_held' | 'active' | 'completed' | 'disputed' | 'cancelled';
export type VerificationSource = 'chrome_web_store' | 'plausible' | 'posthog' | 'ga4' | 'manual';

// Content & Hack Categories
export type HackCategory = 'Active Sacrilege' | 'Clean Loophole' | 'The Graveyard';
export type HackRiskLevel = 'Low' | 'TOS Gray Area' | 'Nuclear';
export type HackSaasTarget = 'Auth' | 'Storage' | 'Database' | 'Logging' | 'Email';
export type HackSubmissionStatus = 'pending' | 'approved' | 'rejected';

/**
 * Community Hack Submission Interface
 * Used for community PR / hack submission forms and database staging.
 */
export interface HackSubmission {
  id?: string;
  title: string;
  replaces_saas: string;
  estimated_monthly_savings: number;
  category?: HackCategory | string;
  risk_level?: HackRiskLevel | string;
  saas_target?: HackSaasTarget | string;
  primitives_abused?: string[];
  author_github: string;
  description?: string;
  status?: HackSubmissionStatus;
  created_at?: string;
  pull_request_url?: string;
  notes?: string;
}

/**
 * Supabase Database Schema Type Definition
 * Mapped to the live Supabase project schema.
 */
export type Database = {
  __InternalSupabase?: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          app_type: AppType;
          category: ListingCategory;
          status: ListingStatus;
          website_url: string;
          creator_id: string;
          verified_dau: number;
          verification_source: VerificationSource;
          verification_identifier: string | null;
          verification_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          app_type: AppType;
          category: ListingCategory;
          status?: ListingStatus;
          website_url: string;
          creator_id: string;
          verified_dau?: number;
          verification_source?: VerificationSource;
          verification_identifier?: string | null;
          verification_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          app_type?: AppType;
          category?: ListingCategory;
          status?: ListingStatus;
          website_url?: string;
          creator_id?: string;
          verified_dau?: number;
          verification_source?: VerificationSource;
          verification_identifier?: string | null;
          verification_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_slots: {
        Row: {
          id: string;
          listing_id: string;
          slot_name: string;
          slot_type: SlotType;
          monthly_price_cents: number;
          is_available: boolean;
          max_sponsors: number;
          guidelines: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          slot_name: string;
          slot_type: SlotType;
          monthly_price_cents: number;
          is_available?: boolean;
          max_sponsors?: number;
          guidelines?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          slot_name?: string;
          slot_type?: SlotType;
          monthly_price_cents?: number;
          is_available?: boolean;
          max_sponsors?: number;
          guidelines?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_slots_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      sponsorships: {
        Row: {
          id: string;
          slot_id: string;
          sponsor_id: string;
          sponsor_name: string;
          sponsor_email: string;
          creative_text: string;
          creative_image_url: string | null;
          creative_target_url: string;
          monthly_amount_cents: number;
          platform_fee_cents: number;
          creator_payout_cents: number;
          stripe_subscription_id: string | null;
          stripe_payment_intent_id: string | null;
          status: SponsorshipStatus;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          sponsor_id: string;
          sponsor_name?: string;
          sponsor_email: string;
          creative_text: string;
          creative_image_url?: string | null;
          creative_target_url: string;
          monthly_amount_cents: number;
          platform_fee_cents: number;
          creator_payout_cents: number;
          stripe_subscription_id?: string | null;
          stripe_payment_intent_id?: string | null;
          status?: SponsorshipStatus;
          start_date?: string;
          end_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          sponsor_id?: string;
          sponsor_name?: string;
          sponsor_email?: string;
          creative_text?: string;
          creative_image_url?: string | null;
          creative_target_url?: string;
          monthly_amount_cents?: number;
          platform_fee_cents?: number;
          creator_payout_cents?: number;
          stripe_subscription_id?: string | null;
          stripe_payment_intent_id?: string | null;
          status?: SponsorshipStatus;
          start_date?: string;
          end_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sponsorships_slot_id_fkey';
            columns: ['slot_id'];
            isOneToOne: false;
            referencedRelation: 'inventory_slots';
            referencedColumns: ['id'];
          },
        ];
      };
      impression_telemetry: {
        Row: {
          id: string;
          slot_id: string;
          telemetry_date: string;
          impressions_count: number;
          clicks_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          telemetry_date?: string;
          impressions_count?: number;
          clicks_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          telemetry_date?: string;
          impressions_count?: number;
          clicks_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'impression_telemetry_slot_id_fkey';
            columns: ['slot_id'];
            isOneToOne: false;
            referencedRelation: 'inventory_slots';
            referencedColumns: ['id'];
          },
        ];
      };
      hack_submissions: {
        Row: {
          id: string;
          title: string;
          replaces_saas: string;
          estimated_monthly_savings: number;
          category: string;
          risk_level: string;
          saas_target: string | null;
          primitives_abused: string[];
          author_github: string;
          description: string | null;
          status: HackSubmissionStatus;
          pull_request_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          replaces_saas: string;
          estimated_monthly_savings: number;
          category?: string;
          risk_level?: string;
          saas_target?: string | null;
          primitives_abused?: string[];
          author_github: string;
          description?: string | null;
          status?: HackSubmissionStatus;
          pull_request_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          replaces_saas?: string;
          estimated_monthly_savings?: number;
          category?: string;
          risk_level?: string;
          saas_target?: string | null;
          primitives_abused?: string[];
          author_github?: string;
          description?: string | null;
          status?: HackSubmissionStatus;
          pull_request_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_slot_telemetry: {
        Args: { p_date: string; p_event: string; p_slot_id: string };
        Returns: Json;
      };
    };
    Enums: {
      app_type: AppType;
      listing_category: ListingCategory;
      listing_status: ListingStatus;
      slot_type: SlotType;
      sponsorship_status: SponsorshipStatus;
      verification_source: VerificationSource;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Type-Safe Generic Helper Types
export type Tables<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row'];

export type TablesInsert<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Update'];

export type Enums<
  T extends keyof Database['public']['Enums']
> = Database['public']['Enums'][T];

// Convenient Model Row Aliases
export type ListingRow = Tables<'listings'>;
export type InventorySlotRow = Tables<'inventory_slots'>;
export type SponsorshipRow = Tables<'sponsorships'>;
export type ImpressionTelemetryRow = Tables<'impression_telemetry'>;
export type HackSubmissionRow = Tables<'hack_submissions'>;

// Connection & Operation Result Types
export interface ConnectionHealth {
  ok: boolean;
  message: string;
  latencyMs?: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: HackSubmission;
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number | null;
}
