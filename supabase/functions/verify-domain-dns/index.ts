import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, token } = await req.json();

    if (!domain || !token) {
      console.log('[verify-domain-dns] Missing domain or token');
      return new Response(
        JSON.stringify({ verified: false, message: 'Missing domain or token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[verify-domain-dns] Verifying domain: ${domain}`);

    // Perform DNS TXT record lookup
    let txtRecords: string[] = [];
    try {
      // Try resolving TXT records for the root domain
      const records = await Deno.resolveDns(domain, 'TXT');
      txtRecords = records.flat();
      console.log(`[verify-domain-dns] TXT records for ${domain}:`, txtRecords);
    } catch (dnsError) {
      console.log(`[verify-domain-dns] No TXT records at root, trying _excellion subdomain`);
    }

    // Also try _excellion subdomain
    try {
      const subdomainRecords = await Deno.resolveDns(`_excellion.${domain}`, 'TXT');
      txtRecords = [...txtRecords, ...subdomainRecords.flat()];
      console.log(`[verify-domain-dns] TXT records for _excellion.${domain}:`, subdomainRecords.flat());
    } catch (dnsError) {
      console.log(`[verify-domain-dns] No TXT records at _excellion subdomain`);
    }

    // Check if any TXT record matches the expected verification token
    const expectedValue = `excellion=${token}`;
    const isVerified = txtRecords.some(record => 
      record.includes(expectedValue) || record === expectedValue
    );

    console.log(`[verify-domain-dns] Expected: ${expectedValue}, Found: ${txtRecords.join(', ')}, Verified: ${isVerified}`);

    if (isVerified) {
      // Update database to mark domain as verified
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase
        .from('custom_domains')
        .update({ 
          is_verified: true, 
          verified_at: new Date().toISOString(),
          status: 'verified'
        })
        .eq('domain', domain)
        .eq('verification_token', token);

      if (updateError) {
        console.error('[verify-domain-dns] Database update error:', updateError);
        return new Response(
          JSON.stringify({ verified: false, message: 'Failed to update verification status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[verify-domain-dns] Domain ${domain} verified successfully`);
      return new Response(
        JSON.stringify({ verified: true, message: 'Domain verified successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        verified: false, 
        message: 'TXT record not found. Make sure you added the DNS record and wait for propagation (up to 48 hours).' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-domain-dns] Error:', error);
    return new Response(
      JSON.stringify({ verified: false, message: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
