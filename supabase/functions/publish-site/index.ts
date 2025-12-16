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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a slug from project name or use projectId
    const slug = projectName 
      ? projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : projectId;
    
    const fileName = `${slug}/index.html`;

    console.log(`Publishing site: ${fileName}`);

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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('published-sites')
      .getPublicUrl(fileName);

    const publishedUrl = urlData.publicUrl;

    console.log(`Site published at: ${publishedUrl}`);

    // Update project with published URL
    const { error: updateError } = await supabase
      .from('builder_projects')
      .update({
        published_url: publishedUrl,
        published_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
      // Don't fail - the site is still published
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publishedUrl,
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
