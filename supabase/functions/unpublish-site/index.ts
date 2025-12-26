import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the project to verify ownership and get published_url
    const { data: project, error: projectError } = await supabase
      .from('builder_projects')
      .select('user_id, published_url')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectId);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization
    if (project.user_id !== null) {
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (project.user_id !== user.id) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Not project owner' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Extract slug from published_url
    if (project.published_url) {
      const match = project.published_url.match(/published-sites\/([^/]+)\//);
      if (match) {
        const slug = match[1];
        console.log(`Unpublishing site: ${slug} for project: ${projectId}`);

        // Delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('published-sites')
          .remove([`${slug}/index.html`]);

        if (deleteError) {
          console.error('Delete error:', deleteError);
        }
      }
    }

    // Clear published_url and published_at from project
    const { error: updateError } = await supabase
      .from('builder_projects')
      .update({
        published_url: null,
        published_at: null,
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update project' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Site unpublished for project: ${projectId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unpublish error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to unpublish site', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
