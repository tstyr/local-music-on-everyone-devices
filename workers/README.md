# Cloudflare Workers - トンネルURL保管庫

このWorkersは、PC側から送信されたトンネルURLをKVストレージに永続化し、PWA側からの取得リクエストに応答します。

## 🚀 セットアップ手順

### 1. KV Namespaceの作成

```bash
cd workers
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

`wrangler.toml` を開き、取得したIDを設定：

```toml
[[kv_namespaces]]
binding = "TUNNEL_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # ← 上記で取得したID
```

### 3. デプロイ

```bash
wrangler deploy
```

## 📡 API仕様

### GET /tunnel

トンネルURLを取得します。

**レスポンス例（成功）:**
```json
{
  "url": "https://abc-123.trycloudflare.com",
  "updatedAt": "2026-02-09T12:00:00.000Z"
}
```

**レスポンス例（未設定）:**
```json
{
  "url": null,
  "message": "トンネルURLが設定されていません"
}
```

### POST /tunnel

トンネルURLを更新します。

**リクエストボディ:**
```json
{
  "url": "https://abc-123.trycloudflare.com"
}
```

**レスポンス例（成功）:**
```json
{
  "success": true,
  "url": "https://abc-123.trycloudflare.com",
  "updatedAt": "2026-02-09T12:00:00.000Z",
  "message": "トンネルURLを保存しました"
}
```

**レスポンス例（エラー）:**
```json
{
  "error": "不正なURL形式です",
  "message": "Cloudflare TunnelのURLまたはlocalhost URLを指定してください"
}
```

## 🧪 テスト

### cURLでテスト

```bash
# URLを設定
curl -X POST https://music.haka01xx.workers.dev/tunnel \
  -H "Content-Type: application/json" \
  -d '{"url":"https://test-123.trycloudflare.com"}'

# URLを取得
curl https://music.haka01xx.workers.dev/tunnel
```

### ブラウザでテスト

```javascript
// URLを取得
fetch('https://music.haka01xx.workers.dev/tunnel')
  .then(r => r.json())
  .then(console.log);

// URLを更新
fetch('https://music.haka01xx.workers.dev/tunnel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://test-123.trycloudflare.com' })
})
  .then(r => r.json())
  .then(console.log);
```

## 🔒 セキュリティ

### URL検証

以下の形式のURLのみ受け付けます：
- ✅ `https://*.trycloudflare.com`
- ✅ `http://localhost:*`（開発用）
- ❌ その他のURL

### CORS設定

すべてのオリジンからのアクセスを許可しています：
```javascript
'Access-Control-Allow-Origin': '*'
```

本番環境では、特定のオリジンのみ許可することを推奨します。

## 📊 KVストレージ

### データ形式

```json
{
  "url": "https://abc-123.trycloudflare.com",
  "updatedAt": "2026-02-09T12:00:00.000Z"
}
```

### KVキー

- `current_tunnel_url`: 現在のトンネルURL

### 制限

- 無料プラン: 1日100,000回の読み取り
- 無料プラン: 1日1,000回の書き込み
- ストレージ: 1GB

## 🛠️ トラブルシューティング

### KV Namespaceが見つからない

```bash
wrangler kv:namespace list
```

で既存のNamespaceを確認できます。

### デプロイエラー

```bash
wrangler whoami
```

でログイン状態を確認してください。

### URLが保存されない

1. KV Namespace IDが正しく設定されているか確認
2. `wrangler deploy` を実行したか確認
3. ブラウザのコンソールでエラーを確認

## 💡 ヒント

- トンネルURLは頻繁に変更されないため、KVストレージで十分
- Workersは無料プランで1日100,000リクエストまで
- KVの読み取りは非常に高速（グローバルに分散）

## 📚 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [KV ストレージ](https://developers.cloudflare.com/kv/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
