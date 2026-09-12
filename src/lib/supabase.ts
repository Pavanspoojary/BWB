/**
 * builtwhilebroke.tech - Supabase Database Client & Utilities
 *
 * Provides type-safe Supabase client initialization, connection health diagnostics,
 * and community hack submission handlers.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  HackSubmission,
  ConnectionHealth,
  SubmissionResult,
  QueryResult,
  ListingRow,
} from './types';

// Default Supabase project credentials per specification
const DEFAULT_SUPABASE_URL = 'https://giyzluujybzqvyxwxfox.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi';

function getRuntimeEnv(): Record<string, string | undefined> {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta.env as Record<string, string | undefined> | undefined)
      : undefined;
  const globalProc =
    typeof globalThis !== 'undefined'
      ? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
      : undefined;
  const procEnv = globalProc?.env;
  return { ...procEnv, ...metaEnv };
}

const env = getRuntimeEnv();

export const supabaseUrl: string =
  import.meta.env?.PUBLIC_SUPABASE_URL ||
  env.PUBLIC_SUPABASE_URL ||
  env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

export const supabaseAnonKey: string =
  import.meta.env?.PUBLIC_SUPABASE_ANON_KEY ||
  env.PUBLIC_SUPABASE_ANON_KEY ||
  env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

/**
 * Default singleton Supabase client instance.
 * Initialized with Database schema generics and zero session persistence (pure static SSG / serverless safe).
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Resilient runtime accessor for Supabase client.
 * Returns either the default singleton or a customized instance when custom credentials are provided.
 */
export function getSupabase(
  customUrl?: string,
  customKey?: string
): SupabaseClient<Database> {
  if (customUrl && customKey) {
    return createClient<Database>(customUrl, customKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return supabase;
}

/**
 * Checks connection health to the Supabase database.
 * Executes a lightweight head count query on the listings table and calculates latency.
 */
export async function checkSupabaseConnection(): Promise<ConnectionHealth> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const client = getSupabase();
    const { count, error } = await client
      .from('listings')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        ok: false,
        message: `Supabase query error: ${error.message}`,
        latencyMs,
        timestamp,
        details: { code: error.code, hint: error.hint },
      };
    }

    return {
      ok: true,
      message: `Successfully connected to Supabase database. Active listings count: ${count ?? 0}.`,
      latencyMs,
      timestamp,
      details: { count },
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : 'Unknown connection failure';
    return {
      ok: false,
      message: `Supabase connection error: ${message}`,
      latencyMs,
      timestamp,
    };
  }
}

/**
 * Alias for checkSupabaseConnection.
 */
export const checkSupabaseHealth = checkSupabaseConnection;

/**
 * Submits a community hack proposal for catalog review.
 * Performs field validation, formats submission payload, and stores in Supabase
 * or generates formatted GitHub PR payload.
 */
export async function submitCommunityHack(
  submission: HackSubmission
): Promise<SubmissionResult> {
  if (!submission.title || submission.title.trim().length < 3) {
    return {
      success: false,
      error: 'Validation failed: Title is required and must be at least 3 characters long.',
    };
  }

  if (!submission.replaces_saas || submission.replaces_saas.trim().length === 0) {
    return {
      success: false,
      error: 'Validation failed: replaces_saas is required.',
    };
  }

  if (
    typeof submission.estimated_monthly_savings !== 'number' ||
    submission.estimated_monthly_savings < 0
  ) {
    return {
      success: false,
      error: 'Validation failed: estimated_monthly_savings must be a positive number or zero.',
    };
  }

  if (!submission.author_github || submission.author_github.trim().length === 0) {
    return {
      success: false,
      error: 'Validation failed: author_github is required.',
    };
  }

  const id =
    submission.id ||
    `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = submission.created_at || new Date().toISOString();

  const formattedSubmission: HackSubmission = {
    id,
    title: submission.title.trim(),
    replaces_saas: submission.replaces_saas.trim(),
    estimated_monthly_savings: Math.floor(submission.estimated_monthly_savings),
    category: submission.category || 'Active Sacrilege',
    risk_level: submission.risk_level || 'TOS Gray Area',
    saas_target: submission.saas_target || 'Storage',
    primitives_abused: Array.isArray(submission.primitives_abused)
      ? submission.primitives_abused
      : [],
    author_github: submission.author_github.trim().replace(/^@/, ''),
    description: submission.description?.trim(),
    status: submission.status || 'pending',
    created_at: createdAt,
    pull_request_url: submission.pull_request_url?.trim(),
    notes: submission.notes?.trim(),
  };

  try {
    const client = getSupabase();
    // Attempt database insert into hack_submissions table if available
    const { data, error } = await (client as any)
      .from('hack_submissions')
      .insert([formattedSubmission])
      .select()
      .maybeSingle();

    if (error) {
      // Table may not exist yet in fresh database or RLS policy restricts insert; return formatted submission with note
      return {
        success: false,
        message: `Database submission note (${error.message}). Please open a GitHub Pull Request with this submission payload.`,
        error: error.message,
        data: formattedSubmission,
      };
    }

    return {
      success: true,
      message: 'Community hack submitted successfully! Awaiting review.',
      data: (data as HackSubmission) || formattedSubmission,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure during submission';
    return {
      success: false,
      message: `Failed to submit: ${errorMsg}. Please submit via GitHub PR.`,
      error: errorMsg,
      data: formattedSubmission,
    };
  }
}

/**
 * Fetches verified listings from Supabase database.
 */
export async function fetchListings(
  limit = 20
): Promise<QueryResult<ListingRow[]>> {
  try {
    const client = getSupabase();
    const { data, error, count } = await client
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .limit(limit);

    if (error) {
      return { data: null, error: new Error(error.message), count: null };
    }
    return { data, error: null, count };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error fetching listings'),
      count: null,
    };
  }
}

// Re-export type definitions for ergonomic importing from @lib/supabase
export type {
  Database,
  HackSubmission,
  HackSubmissionStatus,
  ConnectionHealth,
  SubmissionResult,
  QueryResult,
} from './types';
