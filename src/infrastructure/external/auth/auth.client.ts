import { createClient, SupabaseClient } from "@supabase/supabase-js";
import envs from "@/infrastructure/config/environment/envs";
export type AuthClientType = SupabaseClient;

export class AuthClient {
  public create = () => {
    const client = createClient(envs.SUPABASE_URL, envs.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    return client;
  };
}
