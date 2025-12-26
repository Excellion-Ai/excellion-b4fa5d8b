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
    const { html, projectId, projectName } = await req.json();

    if (!html || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing html or projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate HTML size (5MB limit)
    if (html.length > 5000000) {
      return new Response(
        JSON.stringify({ error: 'HTML content too large (max 5MB)' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's auth context to verify authentication
    const authHeader = req.headers.get('Authorization');
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Get the authenticated user (if any)
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the project to verify ownership
    const { data: project, error: projectError } = await supabase
      .from('builder_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectId);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization:
    // - If project has no user_id (anonymous project), allow publishing
    // - If project has user_id, require matching authenticated user or admin role
    if (project.user_id !== null) {
      // Project belongs to a user - require authentication
      if (authError || !user) {
        console.error('Authentication required for user-owned project');
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user owns the project
      if (project.user_id !== user.id) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleData) {
          console.error('User does not own project and is not admin:', user.id, projectId);
          return new Response(
            JSON.stringify({ error: 'Forbidden: Not project owner' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Admin user publishing project:', user.id, projectId);
      }
    }

    // Generate a slug from project name or use projectId
    const slug = projectName 
      ? projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : projectId;
    
    const fileName = `${slug}/index.html`;

    console.log(`Publishing site: ${fileName} for project: ${projectId}`);

    // Upload HTML to storage
    const { error: uploadError } = await supabase.storage
      .from('published-sites')
      .upload(fileName, html, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload site', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL (storage URL for internal reference)
    const { data: urlData } = supabase.storage
      .from('published-sites')
      .getPublicUrl(fileName);

    const storageUrl = urlData.publicUrl;
    
    // Pretty URL using excellion.app subdomain
    const prettyUrl = `https://${slug}.excellion.app`;

    console.log(`Site published at: ${prettyUrl} (storage: ${storageUrl})`);

    // Update project with published URL (store storage URL for lookups)
    const { error: updateError } = await supabase
      .from('builder_projects')
      .update({
        published_url: storageUrl,
        published_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: prettyUrl,
        storageUrl,
        slug 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Publish error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to publish site', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
