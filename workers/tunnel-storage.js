/**
 * Cloudflare Workers - トンネルURL保管庫
 * 
 * PC側から送信されたトンネルURLを保存し、
 * PWA側からの取得リクエストに応答します。
 * 
 * デプロイ方法:
 * 1. Cloudflare Dashboard → Workers → Create a Service
 * 2. このコードを貼り付け
 * 3. "Save and Deploy" をクリック
 * 
 * または Wrangler CLI:
 * wrangler deploy
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
        // KVストレージから取得（KVを使用する場合）
        // const tunnelUrl = await env.TUNNEL_KV.get('current_tunnel_url');
        
        // または環境変数から取得（シンプルな方法）
        const tunnelUrl = env.TUNNEL_URL || null;
        
        if (!tunnelUrl) {
          return new Response(JSON.stringify({
            error: 'No tunnel URL available',
            message: 'トンネルURLが設定されていません'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        return new Response(JSON.stringify({
          url: tunnelUrl,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Internal server error',
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

        if (!tunnelUrl) {
          return new Response(JSON.stringify({
            error: 'Missing URL',
            message: 'URLが指定されていません'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // URLの検証
        try {
          new URL(tunnelUrl);
        } catch (e) {
          return new Response(JSON.stringify({
            error: 'Invalid URL',
            message: '無効なURLです'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // KVストレージに保存（KVを使用する場合）
        // await env.TUNNEL_KV.put('current_tunnel_url', tunnelUrl);
        
        // 注意: 環境変数は読み取り専用なので、実際にはKVストレージを使用する必要があります
        // この例では、レスポンスのみ返します
        
        return new Response(JSON.stringify({
          success: true,
          url: tunnelUrl,
          message: 'トンネルURLを更新しました',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Internal server error',
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
