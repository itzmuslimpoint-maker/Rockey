import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../../supabaseClient';

/**
 * Lands here after Facebook/Instagram OAuth.
 * Reads `code` + `state` from the URL, posts to /api/instagram/exchange,
 * and redirects the user to / (which renders the Dashboard once logged in).
 */
export default function InstagramCallback() {
  const [status, setStatus] = useState('Connecting your Instagram account...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const fbError = params.get('error_description') || params.get('error');
    const stateUserId = params.get('state');

    if (fbError) {
      setError(decodeURIComponent(fbError.replace(/\+/g, ' ')));
      setStatus('Connection failed.');
      return;
    }

    if (!code) {
      setError('No authorization code returned by Facebook.');
      setStatus('Connection failed.');
      return;
    }

    (async () => {
      try {
        // Prefer the userId baked into `state`, otherwise look up the
        // current Supabase session.
        let userId: string | null = stateUserId || null;
        if (!userId && isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          userId = data.session?.user?.id ?? null;
        }

        const r = await fetch('/api/instagram/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, userId }),
        });
        const json = await r.json();

        if (!r.ok) {
          setError(json.error || 'Failed to exchange code.');
          setStatus('Connection failed.');
          return;
        }

        setStatus(`Connected as @${json.user?.username}. Redirecting...`);
        // Strip query params and send the user back into the app where
        // App.tsx will read ?connected=true and bounce them to the dashboard.
        setTimeout(() => {
          window.location.href = '/?connected=true';
        }, 1200);
      } catch (e: any) {
        setError(e?.message || 'Unexpected error');
        setStatus('Connection failed.');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/20">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{status}</h2>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-left">
            <strong className="block mb-1">Connection failed</strong>
            {error}
            <p className="mt-3 text-xs text-red-500/80">
              Common causes: redirect URI mismatch in your Meta App, the Instagram account is
              not a Business/Creator account, or it isn't linked to a Facebook Page.
            </p>
          </div>
        )}
        {!error && (
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <button
          onClick={() => (window.location.href = '/')}
          className="mt-8 text-sm font-bold text-slate-400 hover:text-pink-600 transition-colors"
        >
          Return to DMflow
        </button>
      </div>
    </div>
  );
}
