import './App.css'
import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import AuthScreen from "@/components/AuthScreen"
import { supabase } from "@/api/supabaseClient"

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const exchangeSessionFromUrl = async (url) => {
      if (!url) return;

      const parseParams = (rawUrl) => {
        try {
          const parsed = new URL(rawUrl);
          const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
          const queryParams = new URLSearchParams(parsed.search);
          return {
            access_token: hashParams.get('access_token') || queryParams.get('access_token'),
            refresh_token: hashParams.get('refresh_token') || queryParams.get('refresh_token'),
          };
        } catch {
          return { access_token: null, refresh_token: null };
        }
      };

      const { access_token, refresh_token } = parseParams(url);
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      } else {
        const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true, url });
        if (error && url.includes('code=')) {
          await supabase.auth.exchangeCodeForSession(url);
        }
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setIsLoading(false);

      if (typeof window !== 'undefined' && (url.includes('access_token=') || url.includes('code='))) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    exchangeSessionFromUrl(window.location?.href);

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    const nativeListener = Capacitor.isNativePlatform()
      ? CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
          if (!url) return;
          await exchangeSessionFromUrl(url);
          await Browser.close();
        })
      : null;

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.getLaunchUrl().then(({ url }) => {
        if (url) {
          exchangeSessionFromUrl(url);
        }
      });
    }

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      nativeListener?.remove();
    };
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A0A0A]" />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 
