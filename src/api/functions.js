import { supabase } from './supabaseClient';

const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!functionsBaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_FUNCTIONS_BASE_URL or VITE_SUPABASE_ANON_KEY');
}

async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    return null;
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session) {
    return data.session;
  }

  return refreshed.session;
}

async function postFunction(path, payload) {
  const session = await ensureSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const { error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(`Auth check failed: ${userError.message}`);
  }

  const response = await fetch(`${functionsBaseUrl}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Function ${path} failed: ${response.status} ${text || response.statusText}`);
  }

  return response.json();
}

export function invokeLLM(payload) {
  return postFunction('generate-slides', payload);
}

export function generateImage(payload) {
  return postFunction('generate-image', payload);
}
