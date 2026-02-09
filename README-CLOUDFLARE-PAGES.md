# Cloudflare Pages デプロイガイド

このプロジェクトはCloudflare Pages専用に最適化されています。

## 📋 前提条件

- Node.js 18以上
- Cloudflare アカウント
- PC側に音楽サーバー（Cloudflare Tunnel経由）

## 🚀 デプロイ手順

### 1. ビルド

```bash
npm install
npm run build
```

ビルド成果物は `out/` ディレクトリに生成されます。

### 2. Cloudflare Pagesにデプロイ

#### 方法A: Cloudflare Dashboard（推奨）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. "Pages" → "Create a project" をクリック
3. GitHubリポジトリを接続
4. ビルド設定:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`
5. "Save and Deploy" をクリック

#### 方法B: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy out --project-name=music-player
```

### 3. Workers URLの設定

`lib/api-config.ts` の `WORKERS_URL` を更新してください：

```typescript
const WORKERS_URL = 'https://your-workers-url.workers.dev/tunnel';
```

## 🔧 PC側のセットアップ

### 1. Cloudflare Tunnel の起動

PC側で音楽サーバーを起動し、Cloudflare Tunnelで公開します：

```bash
# トンネルの作成（初回のみ）
cloudflared tunnel create music-server

# トンネルの起動
cloudflared tunnel --url http://localhost:3000
```

### 2. トンネルURLの同期

トンネルURLが取得できたら、Workersに自動で送信します：

```bash
npm run tunnel:sync -- --url https://your-tunnel-url.trycloudflare.com
```

または環境変数で：

```bash
TUNNEL_URL=https://your-tunnel-url.trycloudflare.com npm run tunnel:sync
```

## 📱 iPad PWAとして使用

### インストール方法

1. SafariでデプロイしたURLを開く
2. 共有ボタン（□↑）をタップ
3. "ホーム画面に追加" を選択
4. "追加" をタップ

### PWA機能

- ✅ オフラインキャッシュ
- ✅ フルスクリーン表示
- ✅ ホーム画面アイコン
- ✅ スプラッシュスクリーン
- ✅ ステータスバー統合

## 🎵 使い方

1. **初回起動時**: アプリが自動的にWorkersから最新のトンネルURLを取得
2. **音楽再生**: 取得したURLを使って音楽サーバーに接続
3. **自動更新**: トンネルURLが変更されても、次回起動時に自動で更新

## 🔄 トンネルURL更新の仕組み

```
PC (音楽サーバー)
  ↓ Cloudflare Tunnel
  ↓ https://xxx.trycloudflare.com
  ↓
  ↓ POST /tunnel
  ↓
Cloudflare Workers (URL保管庫)
  ↓
  ↓ GET /tunnel
  ↓
Cloudflare Pages (PWA)
  ↓
iPad/ブラウザ
```

## 📝 削除されたファイル

Cloudflare Pages専用化により、以下のファイルは不要になりました：

### サーバーサイド機能
- `app/api/**/*` - すべてのAPIルート
- `lib/auth.ts` - NextAuth認証
- `lib/prisma.ts` - データベース接続
- `lib/music-scanner.ts` - ファイルスキャナー
- `lib/system-info.ts` - システム情報
- `prisma/**/*` - データベーススキーマ

### Electron関連
- `electron/**/*` - Electronメインプロセス
- `types/electron.d.ts` - Electron型定義

### サーバー設定
- `server.js` - カスタムサーバー
- `.env` - 環境変数（Workersで管理）

## 🛠️ トラブルシューティング

### トンネルURLが取得できない

1. Workers URLが正しく設定されているか確認
2. Workersがデプロイされているか確認
3. ブラウザのコンソールでエラーを確認

### 音楽が再生できない

1. PC側の音楽サーバーが起動しているか確認
2. Cloudflare Tunnelが正常に動作しているか確認
3. トンネルURLが最新か確認（`npm run tunnel:sync` を再実行）

### PWAがインストールできない

1. HTTPSで接続されているか確認（Cloudflare Pagesは自動的にHTTPS）
2. manifest.jsonが正しく読み込まれているか確認
3. Safariのキャッシュをクリア

## 📚 参考リンク

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Cloudflare Tunnel ドキュメント](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
