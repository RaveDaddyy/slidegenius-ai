import Constants from 'expo-constants';

type ExtraConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  functionsBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const SUPABASE_URL = extra.supabaseUrl ?? '';
export const SUPABASE_ANON_KEY = extra.supabaseAnonKey ?? '';
export const FUNCTIONS_BASE_URL = extra.functionsBaseUrl ?? '';

export function requireEnv(name: string, value: string) {
  if (!value) {
    throw new Error(`Missing config for ${name}`);
  }
}
