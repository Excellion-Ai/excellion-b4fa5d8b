import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to GitHub...');
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(searchParams.get('error_description') || 'GitHub authorization failed');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      // Verify state
      const storedState = sessionStorage.getItem('github_oauth_state');
      if (state !== storedState) {
        setStatus('error');
        setMessage('Invalid state parameter');
        return;
      }

      sessionStorage.removeItem('github_oauth_state');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setStatus('error');
          setMessage('Not authenticated. Please log in first.');
          return;
        }

        const redirectUri = `${window.location.origin}/github-callback`;

        const response = await supabase.functions.invoke('github-oauth-callback', {
          body: {},
          headers: {},
        });

        // Actually we need to call via URL params
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-oauth-callback?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        
        const res = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await res.json();

        if (!res.ok || result.error) {
          setStatus('error');
          setMessage(result.error || 'Failed to connect GitHub');
          return;
        }

        setStatus('success');
        setGithubUsername(result.github_username);
        setMessage(`Connected as ${result.github_username}`);

        // Redirect back to builder after 2 seconds
        setTimeout(() => {
          navigate('/secret-builder', { replace: true });
        }, 2000);

      } catch (err) {
        console.error('GitHub callback error:', err);
        setStatus('error');
        setMessage('Failed to connect GitHub');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <p className="text-lg font-medium text-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to builder...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-lg font-medium text-foreground">Connection Failed</p>
            <p className="text-sm text-muted-foreground">{message}</p>
            <button
              onClick={() => navigate('/secret-builder', { replace: true })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Builder
            </button>
          </>
        )}
      </div>
    </div>
  );
}
