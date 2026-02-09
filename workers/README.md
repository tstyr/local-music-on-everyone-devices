# Cloudflare Workers - トンネルURL保管庫

このWorkersは、PC側から送信されたトンネルURLを保存し、PWA側からの取得リクエストに応答します。

## 🚀 デプロイ方法

### 方法1: Cloudflare Dashboard（簡単）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. "Workers & Pages" → "Create application" → "Create Worker" をクリック
3. Worker名を入力（例: `music-tunnel-storage`）
4. "Deploy" をクリック
5. "Edit code" をクリック
6. `tunnel-storage.js` の内容をコピー＆ペースト
7. "Save and Deploy" をクリック

### 方法2: Wrangler CLI（推奨）

```bash
# Wranglerのインストール
npm install -g wrangler

# ログイン
wrangler login

# デプロイ
cd workers
wrangler deploy
```

## 🔧 KVストレージの設定（推奨）

環境変数は読み取り専用なので、動的にURLを更新するにはKVストレージを使用します。

### 1. KVネームスペースの作成

```bash
wrangler kv:namespace create "TUNNEL_KV"
```

出力例:
```
🌀 Creating namespace with title "music-tunnel-storage-TUNNEL_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "TUNNEL_KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

### 2. wrangler.tomlの更新

```toml
[[kv_namespaces]]
binding = "TUNNEL_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # 上記で取得したID
```

### 3. 再デプロイ

```bash
wrangler deploy
```

## 📡 API仕様

### GET /tunnel

トンネルURLを取得します。

**レスポンス例（成功）:**
```json
{
  "url": "https://xxx.trycloudflare.com",
  "timestamp": "2024-02-09T12:00:00.000Z"
}
```

**レスポンス例（未設定）:**
```json
{
  "error": "No tunnel URL available",
  "message": "トンネルURLが設定されていません"
}
```

### POST /tunnel

トンネルURLを更新します。

**リクエストボディ:**
```json
{
  "url": "https://xxx.trycloudflare.com"
}
```

**レスポンス例（成功）:**
```json
{
  "success": true,
  "url": "https://xxx.trycloudflare.com",
  "message": "トンネルURLを更新しました",
  "timestamp": "2024-02-09T12:00:00.000Z"
}
```

## 🧪 テスト

### cURLでテスト

```bash
# URLを設定
curl -X POST https://your-worker.workers.dev/tunnel \
  -H "Content-Type: application/json" \
  -d '{"url":"https://test.trycloudflare.com"}'

# URLを取得
curl https://your-worker.workers.dev/tunnel
```

### ブラウザでテスト

```javascript
// URLを取得
fetch('https://your-worker.workers.dev/tunnel')
  .then(r => r.json())
  .then(console.log);

// URLを更新
fetch('https://your-worker.workers.dev/tunnel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://test.trycloudflare.com' })
})
  .then(r => r.json())
  .then(console.log);
```

## 🔒 セキュリティ

本番環境では、以下のセキュリティ対策を検討してください：

1. **認証の追加**: POST /tunnel に認証を追加
2. **レート制限**: Cloudflare Rate Limitingを使用
3. **CORS制限**: 特定のオリジンのみ許可

### 認証の例

```javascript
// tunnel-storage.js に追加
const AUTH_TOKEN = env.AUTH_TOKEN; // Workersの環境変数

if (request.method === 'POST' && url.pathname === '/tunnel') {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // ... 以下、既存のコード
}
```

## 📊 モニタリング

Cloudflare Dashboardで以下を確認できます：

- リクエスト数
- エラー率
- レスポンスタイム
- KVストレージの使用量

## 💡 ヒント

- KVストレージは無料プランで1日100,000回の読み取りが可能
- Workersは無料プランで1日100,000リクエストまで
- トンネルURLは頻繁に変更されないため、KVストレージで十分
