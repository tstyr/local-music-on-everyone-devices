#!/usr/bin/env node

/**
 * トンネルURL同期スクリプト
 * 
 * Cloudflare TunnelのURLをWorkersに自動でPOSTします。
 * 
 * 使い方:
 * 1. package.jsonに以下を追加:
 *    "tunnel:sync": "node scripts/sync-tunnel.js"
 * 
 * 2. 実行:
 *    npm run tunnel:sync -- --url https://your-tunnel-url.trycloudflare.com
 * 
 * または環境変数で設定:
 *    TUNNEL_URL=https://your-tunnel-url.trycloudflare.com npm run tunnel:sync
 */

const https = require('https');
const http = require('http');

// 設定
const WORKERS_URL = process.env.WORKERS_URL || 'https://local-music-on-everyone-devices.haka01xx.workers.dev/tunnel';

// コマンドライン引数から取得
const args = process.argv.slice(2);
let tunnelUrl = process.env.TUNNEL_URL;

// --url オプションをパース
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    tunnelUrl = args[i + 1];
    break;
  }
}

if (!tunnelUrl) {
  console.error('❌ エラー: トンネルURLが指定されていません');
  console.error('');
  console.error('使い方:');
  console.error('  npm run tunnel:sync -- --url https://your-tunnel-url.trycloudflare.com');
  console.error('または:');
  console.error('  TUNNEL_URL=https://your-tunnel-url.trycloudflare.com npm run tunnel:sync');
  process.exit(1);
}

// URLの正規化
tunnelUrl = tunnelUrl.replace(/\/$/, ''); // 末尾のスラッシュを削除

console.log('🚀 トンネルURL同期スクリプト');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 トンネルURL: ${tunnelUrl}`);
console.log(`☁️  Workers URL: ${WORKERS_URL}`);
console.log('');

// WorkersにPOST
const postData = JSON.stringify({
  url: tunnelUrl,
  timestamp: new Date().toISOString()
});

const url = new URL(WORKERS_URL);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const client = url.protocol === 'https:' ? https : http;

console.log('⏳ Workersに送信中...');

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ 成功: トンネルURLを更新しました');
      console.log('');
      try {
        const response = JSON.parse(data);
        console.log('📦 レスポンス:', response);
      } catch (e) {
        console.log('📦 レスポンス:', data);
      }
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✨ 完了しました！');
    } else {
      console.error(`❌ エラー: HTTPステータス ${res.statusCode}`);
      console.error('レスポンス:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ エラー:', error.message);
  console.error('');
  console.error('トラブルシューティング:');
  console.error('1. Workers URLが正しいか確認してください');
  console.error('2. インターネット接続を確認してください');
  console.error('3. Workersがデプロイされているか確認してください');
  process.exit(1);
});

req.write(postData);
req.end();
