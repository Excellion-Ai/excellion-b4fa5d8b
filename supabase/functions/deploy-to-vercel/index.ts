import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeployRequest {
  projectName: string;
  files: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const vercelToken = Deno.env.get('VERCEL_TOKEN');

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { projectName, files }: DeployRequest = await req.json();

    if (!projectName || !files) {
      return new Response(JSON.stringify({ error: 'Missing projectName or files' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!vercelToken) {
      const repoName = projectName.replace(/\s+/g, '-').toLowerCase();
      const vercelImportUrl = `https://vercel.com/new/clone?s=${encodeURIComponent('https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts')}&project-name=${repoName}&repository-name=${repoName}`;
      
      return new Response(JSON.stringify({ 
        success: true,
        method: 'redirect',
        deployUrl: vercelImportUrl,
        message: 'Redirect to Vercel for deployment'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vercelFiles = Object.entries(files).map(([path, content]) => ({
      file: path,
      data: content,
    }));

    const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName.replace(/\s+/g, '-').toLowerCase(),
        files: vercelFiles,
        projectSettings: {
          framework: 'vite',
          buildCommand: 'npm run build',
          outputDirectory: 'dist',
          installCommand: 'npm install',
        },
      }),
    });

    if (!deployResponse.ok) {
      const errorData = await deployResponse.json();
      console.error('Vercel API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Vercel deployment failed',
        details: errorData 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const deployData = await deployResponse.json();

    console.log('Vercel deployment initiated:', deployData.url);

    return new Response(JSON.stringify({
      success: true,
      method: 'api',
      deployUrl: `https://${deployData.url}`,
      deploymentId: deployData.id,
      message: 'Deployment initiated successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Deploy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
