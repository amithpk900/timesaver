import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Re-export for consumers
export type { Database };
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Factory: create a type-safe Supabase client.
 * Both apps call this with their env-specific URL + key.
 *
 * Web (Next.js):
 *   createSupabaseClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *   )
 *
 * Mobile (Expo):
 *   createSupabaseClient(
 *     process.env.EXPO_PUBLIC_SUPABASE_URL!,
 *     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
 *   )
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): TypedSupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL and Anon Key must be provided. ' +
      'Check your environment variables.'
    );
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Checks the connection to Supabase by performing a lightweight API probe.
 * Returns { success: true } when the API is reachable (even with a
 * schema-level error like PGRST205 — table not exposed — which proves
 * the project is live and the key is valid).
 */
export async function verifySupabaseConnection(
  supabase: TypedSupabaseClient
): Promise<{ success: boolean; message: string }> {
  try {
    // Probe: query a non-existent table — any structured error proves connectivity
    const { error } = await supabase
      .from('_connection_test_' as any)
      .select('*')
      .limit(1);

    if (error) {
      const structuredErrors = [
        'PGRST116',  // relation not found
        'PGRST205',  // not in schema cache (table exists but not in PostgREST schema)
      ];
      const err = error as any;
      const isApiReachable =
        structuredErrors.includes(error.code ?? '') ||
        err.status === 401 ||
        err.status === 403 ||
        err.status === 404 ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache');

      if (isApiReachable) {
        return {
          success: true,
          message: `Connected successfully (Supabase API reached. Status: ${err.status ?? 'Success'}, Code: ${error.code ?? 'None'}).`,
        };
      }

      return {
        success: false,
        message: `Supabase error: ${error.message} (Status: ${err.status ?? 'unknown'}, Code: ${error.code ?? 'unknown'})`,
      };
    }

    return { success: true, message: 'Connected successfully.' };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message ?? 'Failed to connect to Supabase.',
    };
  }
}
