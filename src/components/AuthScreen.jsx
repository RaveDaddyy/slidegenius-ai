import React, { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/api/supabaseClient';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSigningUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative
        ? 'com.slidegenius.ai://auth/callback'
        : `${window.location.origin}/auth/callback`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          queryParams: { response_mode: 'query' },
          ...(isNative ? { skipBrowserRedirect: true } : {}),
        },
      });

      if (oauthError) throw oauthError;
      if (isNative && data?.url) {
        await Browser.open({ url: data.url });
      }
    } catch (err) {
      setError(err?.message || 'Apple sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <form onSubmit={handleAuth} className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold">SlideGenius AI</h1>
        <p className="text-sm text-white/50 mt-2">
          {isSigningUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500/60"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500/60"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <p className="text-sm text-red-400 mt-4">{error}</p> : null}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-orange-500 py-3 text-black font-semibold disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Please wait…' : isSigningUp ? 'Create account' : 'Sign in'}
        </button>

        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-white py-3 text-black font-semibold disabled:opacity-60"
          onClick={handleAppleSignIn}
          disabled={isLoading}
        >
          Continue with Apple
        </button>

        <button
          type="button"
          className="mt-4 w-full text-sm text-white/60 hover:text-white"
          onClick={() => setIsSigningUp((prev) => !prev)}
        >
          {isSigningUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
}
