import { FUNCTIONS_BASE_URL, requireEnv } from './env';
import { supabase } from './supabase';

requireEnv('functionsBaseUrl', FUNCTIONS_BASE_URL);

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function postFunction<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${FUNCTIONS_BASE_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Function ${path} failed: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export function invokeLLM(payload: { prompt: string; response_json_schema: unknown }) {
  return postFunction<{ slides: Array<{ index: number; headline: string; highlightWord: string; subline: string }> }>(
    'generate-slides',
    payload
  );
}

export function generateImage(payload: { prompt: string }) {
  return postFunction<{ url: string }>('generate-image', payload);
}
