/**
 * Cloudflare Workers - トンネルURL保管庫（KV対応版）
 * 
 * PC側から送信されたトンネルURLをKVストレージに永続化し、
 * PWA側からの取得リクエストに応答します。
 * 
 * デプロイ方法:
 * 1. KV Namespaceを作成: wrangler kv:namespace create "TUNNEL_KV"
 * 2. wrangler.toml に KV ID を設定
 * 3. wrangler deploy
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONSリクエスト（プリフライト）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // GET /tunnel - トンネルURLを取得
    if (request.method === 'GET' && url.pathname === '/tunnel') {
      try {
        // KVストレージから取得
        const data = await env.TUNNEL_KV.get('current_tunnel_url', 'json');
        
        if (!data || !data.url) {
          return new Response(JSON.stringify({
            url: null,
            message: 'トンネルURLが設定されていません'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        return new Response(JSON.stringify({
          url: data.url,
          updatedAt: data.updatedAt
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'KV読み取りエラー',
          message: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // POST /tunnel - トンネルURLを更新
    if (request.method === 'POST' && url.pathname === '/tunnel') {
      try {
        const body = await request.json();
        const { url: tunnelUrl } = body;

        if (!tunnelUrl || typeof tunnelUrl !== 'string') {
          return new Response(JSON.stringify({
            error: 'URLが必要です',
            message: 'URLが指定されていません'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // URL形式の検証
        const isValid = 
          (tunnelUrl.startsWith('https://') && tunnelUrl.includes('.trycloudflare.com')) ||
          tunnelUrl.startsWith('http://localhost:');

        if (!isValid) {
          return new Response(JSON.stringify({
            error: '不正なURL形式です',
            message: 'Cloudflare TunnelのURLまたはlocalhost URLを指定してください'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // KVストレージに保存
        const data = {
          url: tunnelUrl,
          updatedAt: new Date().toISOString()
        };
        
        await env.TUNNEL_KV.put('current_tunnel_url', JSON.stringify(data));
        
        return new Response(JSON.stringify({
          success: true,
          url: data.url,
          updatedAt: data.updatedAt,
          message: 'トンネルURLを保存しました'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'KV書き込みエラー',
          message: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // その他のリクエスト
    return new Response(JSON.stringify({
      error: 'Not found',
      message: 'エンドポイントが見つかりません',
      available_endpoints: [
        'GET /tunnel - トンネルURLを取得',
        'POST /tunnel - トンネルURLを更新'
      ]
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};
