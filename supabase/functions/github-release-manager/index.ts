import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Target GitHub Repository Configuration
const GITHUB_OWNER = 'praveen801771-cmd';
const GITHUB_REPO = 'apk-hub-releases';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Enforce POST requests only
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed. Only POST requests are supported.' }, 405);
  }

  try {
    // 3. Read Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }

    // 4. Initialize Supabase Client with environment variables & caller's Authorization
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[github-release-manager] Missing server Supabase configuration.');
      return jsonResponse({ success: false, error: 'Server configuration error' }, 500);
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // 5. Authenticate Caller using Supabase Auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }

    // 6. Authorize: Verify admin role in public.profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return jsonResponse({ success: false, error: 'Admin access required' }, 403);
    }

    // 7. Parse request payload
    let payload: { action?: string; [key: string]: unknown } = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const action = payload.action || 'check_repo';

    // 8. ONLY AFTER admin check passes: Read GITHUB_TOKEN from Deno.env
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      console.error('[github-release-manager] Missing GITHUB_TOKEN secret in environment.');
      return jsonResponse({ success: false, error: 'GitHub service secret is not configured' }, 500);
    }

    const githubHeaders = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'APK-Hub-Release-Manager'
    };

    // 9. Execute requested GitHub Operation
    switch (action) {
      case 'check_repo':
      case 'status': {
        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
          headers: githubHeaders
        });

        if (!ghRes.ok) {
          const ghErr = await ghRes.text();
          console.error('[github-release-manager] GitHub repo check failed:', ghRes.status);
          return jsonResponse({
            success: false,
            error: `GitHub repository check failed (Status: ${ghRes.status})`
          }, ghRes.status);
        }

        const repoData = await ghRes.json();
        return jsonResponse({
          success: true,
          repository: {
            name: repoData.name,
            full_name: repoData.full_name,
            private: repoData.private,
            html_url: repoData.html_url
          }
        });
      }

      case 'list_releases': {
        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=20`, {
          headers: githubHeaders
        });

        if (!ghRes.ok) {
          return jsonResponse({
            success: false,
            error: `Failed to fetch releases from GitHub (Status: ${ghRes.status})`
          }, ghRes.status);
        }

        const releases = await ghRes.json();
        return jsonResponse({
          success: true,
          releases: Array.isArray(releases) ? releases.map((r: Record<string, unknown>) => ({
            id: r.id,
            tag_name: r.tag_name,
            name: r.name,
            created_at: r.created_at,
            published_at: r.published_at,
            html_url: r.html_url,
            assets_count: Array.isArray(r.assets) ? r.assets.length : 0
          })) : []
        });
      }

      case 'create_release': {
        const tagName = String(payload.tag_name || '').trim();
        const releaseName = String(payload.name || tagName).trim();
        const releaseBody = String(payload.body || '').trim();
        const isDraft = Boolean(payload.draft);
        const isPrerelease = Boolean(payload.prerelease);

        if (!tagName) {
          return jsonResponse({ success: false, error: 'Parameter "tag_name" is required' }, 400);
        }

        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`, {
          method: 'POST',
          headers: {
            ...githubHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tag_name: tagName,
            name: releaseName,
            body: releaseBody,
            draft: isDraft,
            prerelease: isPrerelease
          })
        });

        if (!ghRes.ok) {
          const ghErr = await ghRes.json().catch(() => ({ message: 'Release creation failed' }));
          return jsonResponse({
            success: false,
            error: ghErr.message || `GitHub release creation failed with status ${ghRes.status}`
          }, ghRes.status);
        }

        const createdRelease = await ghRes.json();
        return jsonResponse({
          success: true,
          release: {
            id: createdRelease.id,
            tag_name: createdRelease.tag_name,
            name: createdRelease.name,
            html_url: createdRelease.html_url,
            upload_url: createdRelease.upload_url
          }
        }, 201);
      }

      default:
        return jsonResponse({
          success: false,
          error: `Unsupported action: "${action}". Valid actions are: check_repo, list_releases, create_release.`
        }, 400);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[github-release-manager] Internal exception caught:', errorMessage);
    return jsonResponse({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
});
