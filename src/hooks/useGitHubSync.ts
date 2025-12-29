import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteSpec } from '@/types/site-spec';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

interface GitHubConnection {
  githubUsername: string | null;
  isConnected: boolean;
}

interface SyncResult {
  success: boolean;
  repoUrl?: string;
  commitSha?: string;
  error?: string;
}

interface ProjectGitHubInfo {
  github_repo_url: string | null;
  github_last_synced_at: string | null;
}

export function useGitHubSync(projectId: string | null) {
  const [connection, setConnection] = useState<GitHubConnection>({
    githubUsername: null,
    isConnected: false,
  });
  const [projectGithub, setProjectGithub] = useState<ProjectGitHubInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check GitHub connection status
  const checkConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConnection({ githubUsername: null, isConnected: false });
        return;
      }

      const { data, error } = await supabase
        .from('github_connections')
        .select('github_username')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking GitHub connection:', error);
        setConnection({ githubUsername: null, isConnected: false });
        return;
      }

      setConnection({
        githubUsername: data?.github_username || null,
        isConnected: !!data,
      });
    } catch (err) {
      console.error('Error checking GitHub connection:', err);
      setConnection({ githubUsername: null, isConnected: false });
    }
  }, []);

  // Fetch project GitHub info
  const fetchProjectGithub = useCallback(async () => {
    if (!projectId) {
      setProjectGithub(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('builder_projects')
        .select('github_repo_url, github_last_synced_at')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project GitHub info:', error);
        return;
      }

      setProjectGithub(data as ProjectGitHubInfo);
    } catch (err) {
      console.error('Error fetching project GitHub info:', err);
    }
  }, [projectId]);

  useEffect(() => {
    checkConnection();
    fetchProjectGithub();
  }, [checkConnection, fetchProjectGithub]);

  // Initiate GitHub OAuth flow
  const connectGitHub = useCallback(() => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub OAuth not configured');
      return;
    }

    const redirectUri = `${window.location.origin}/github-callback`;
    const scope = 'repo';
    const state = crypto.randomUUID();
    
    // Store state for verification
    sessionStorage.setItem('github_oauth_state', state);
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    
    window.location.href = authUrl;
  }, []);

  // Disconnect GitHub
  const disconnectGitHub = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const { error } = await supabase
        .from('github_connections')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        setError('Failed to disconnect GitHub');
        return;
      }

      setConnection({ githubUsername: null, isConnected: false });
    } catch (err) {
      setError('Failed to disconnect GitHub');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync project to GitHub
  const syncToGitHub = useCallback(async (
    projectName: string,
    siteSpec: SiteSpec,
    reactCode?: string,
    commitMessage?: string
  ): Promise<SyncResult> => {
    if (!projectId) {
      return { success: false, error: 'No project selected' };
    }

    if (!connection.isConnected) {
      return { success: false, error: 'GitHub not connected' };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await supabase.functions.invoke('sync-to-github', {
        body: {
          projectId,
          projectName,
          siteSpec,
          reactCode,
          commitMessage,
        },
      });

      if (response.error) {
        const errorMessage = response.error.message || 'Sync failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const result = response.data;

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      // Refresh project GitHub info
      await fetchProjectGithub();

      return {
        success: true,
        repoUrl: result.repoUrl,
        commitSha: result.commitSha,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [projectId, connection.isConnected, fetchProjectGithub]);

  return {
    connection,
    projectGithub,
    isLoading,
    isSyncing,
    error,
    connectGitHub,
    disconnectGitHub,
    syncToGitHub,
    checkConnection,
    fetchProjectGithub,
  };
}
