# Cloudflare Pages デプロイチェックリスト

このチェックリストに従って、プロジェクトをCloudflare Pagesにデプロイしてください。

## ✅ デプロイ前の準備

### 1. 不要ファイルの削除（オプション）

```bash
node scripts/cleanup-for-pages.js
```

このスクリプトは以下を削除します：
- [ ] `app/api/` - すべてのAPIルート
- [ ] `prisma/` - データベース関連
- [ ] `lib/auth.ts` - NextAuth認証
- [ ] `lib/prisma.ts` - Prismaクライアント
- [ ] `lib/music-scanner.ts` - ファイルスキャナー
- [ ] `lib/system-info.ts` - システム情報
- [ ] `lib/socket.ts` - Socket.io
- [ ] `electron/` - Electronアプリ
- [ ] `server.js` - カスタムサーバー

### 2. Workers URLの設定

`lib/api-config.ts` を開き、`WORKERS_URL` を更新：

```typescript
const WORKERS_URL = 'https://your-workers-url.workers.dev/tunnel';
```

- [ ] Workers URLを設定済み

### 3. 依存関係の確認

```bash
npm install
```

- [ ] 依存関係をインストール済み

### 4. ビルドテスト

```bash
npm run build
```

- [ ] ビルドが成功
- [ ] `out/` ディレクトリが生成された
- [ ] エラーがない

## 🚀 Cloudflare Pagesへのデプロイ

### 方法A: GitHub連携（推奨）

1. [ ] GitHubリポジトリにプッシュ
2. [ ] [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
3. [ ] "Pages" → "Create a project" をクリック
4. [ ] GitHubリポジトリを選択
5. [ ] ビルド設定:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: `/`
6. [ ] "Save and Deploy" をクリック
7. [ ] デプロイ完了を待つ
8. [ ] デプロイされたURLを確認

### 方法B: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy out --project-name=music-player
```

- [ ] Wranglerをインストール
- [ ] ログイン完了
- [ ] デプロイ成功
- [ ] URLを確認

## ☁️ Cloudflare Workersのセットアップ

### 1. Workersのデプロイ

```bash
cd workers
wrangler deploy
```

- [ ] Workersをデプロイ
- [ ] Workers URLを取得（例: `https://xxx.workers.dev`）

### 2. KVストレージの設定（推奨）

```bash
wrangler kv:namespace create "TUNNEL_KV"
```

- [ ] KVネームスペースを作成
- [ ] `wrangler.toml` にKV IDを追加
- [ ] Workersを再デプロイ

### 3. Workersのテスト

```bash
# URLを設定
curl -X POST https://your-workers-url.workers.dev/tunnel \
  -H "Content-Type: application/json" \
  -d '{"url":"https://test.trycloudflare.com"}'

# URLを取得
curl https://your-workers-url.workers.dev/tunnel
```

- [ ] POST /tunnel が動作
- [ ] GET /tunnel が動作
- [ ] レスポンスが正しい

## 🖥️ PC側のセットアップ

### 1. Cloudflare Tunnelのインストール

```bash
# Windows
winget install --id Cloudflare.cloudflared

# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

- [ ] cloudflaredをインストール

### 2. トンネルの起動

```bash
# 音楽サーバーを起動（別ターミナル）
npm run dev

# トンネルを起動
cloudflared tunnel --url http://localhost:3000
```

- [ ] 音楽サーバーが起動
- [ ] トンネルが起動
- [ ] トンネルURLを取得（例: `https://xxx.trycloudflare.com`）

### 3. トンネルURLの同期

```bash
npm run tunnel:sync -- --url https://your-tunnel-url.trycloudflare.com
```

または環境変数で：

```bash
TUNNEL_URL=https://your-tunnel-url.trycloudflare.com npm run tunnel:sync
```

- [ ] トンネルURLを同期
- [ ] 成功メッセージを確認

## 📱 iPad PWAのインストール

### 1. Safariで開く

- [ ] iPadのSafariでデプロイしたURLを開く
- [ ] ページが正しく表示される

### 2. ホーム画面に追加

1. [ ] 共有ボタン（□↑）をタップ
2. [ ] "ホーム画面に追加" を選択
3. [ ] アイコン名を確認（"Music"）
4. [ ] "追加" をタップ

### 3. PWAの動作確認

- [ ] ホーム画面にアイコンが表示
- [ ] アイコンをタップして起動
- [ ] フルスクリーン表示される
- [ ] ステータスバーが統合されている
- [ ] 音楽が再生できる

## 🧪 動作テスト

### 基本機能

- [ ] トップページが表示される
- [ ] 曲リストが表示される
- [ ] 曲を選択できる
- [ ] 音楽が再生される
- [ ] 一時停止/再生が動作
- [ ] 次の曲/前の曲が動作
- [ ] ボリューム調整が動作
- [ ] プログレスバーが動作

### PWA機能

- [ ] オフラインでもUIが表示される
- [ ] ホーム画面アイコンが正しい
- [ ] スプラッシュスクリーンが表示される
- [ ] フルスクリーンモードが動作
- [ ] ステータスバーの色が正しい

### トンネル接続

- [ ] 初回起動時にトンネルURLを取得
- [ ] 音楽サーバーに接続できる
- [ ] 音楽がストリーミング再生される
- [ ] トンネルURL変更後も自動で更新される

## 🔧 トラブルシューティング

### ビルドエラー

- [ ] `npm install` を実行
- [ ] `node_modules` を削除して再インストール
- [ ] Next.jsのバージョンを確認

### デプロイエラー

- [ ] ビルドコマンドが正しいか確認
- [ ] 出力ディレクトリが `out` か確認
- [ ] Cloudflare Pagesのログを確認

### 音楽が再生できない

- [ ] PC側の音楽サーバーが起動しているか確認
- [ ] Cloudflare Tunnelが動作しているか確認
- [ ] トンネルURLが最新か確認
- [ ] ブラウザのコンソールでエラーを確認

### PWAがインストールできない

- [ ] HTTPSで接続されているか確認
- [ ] manifest.jsonが正しく読み込まれているか確認
- [ ] Safariのキャッシュをクリア
- [ ] プライベートブラウズモードでないか確認

## 📊 完了確認

すべてのチェックが完了したら：

- [ ] デプロイURL: `https://___________________`
- [ ] Workers URL: `https://___________________`
- [ ] トンネルURL: `https://___________________`
- [ ] PWAインストール完了
- [ ] 音楽再生動作確認完了

## 🎉 おめでとうございます！

Cloudflare Pagesへのデプロイが完了しました。

次のステップ：
1. カスタムドメインの設定（オプション）
2. 分析ツールの追加（オプション）
3. パフォーマンスの最適化
4. セキュリティ設定の強化
