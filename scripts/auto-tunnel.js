#!/usr/bin/env node

/**
 * 自動トンネル起動＆URL同期スクリプト
 * 
 * Cloudflare Tunnelを起動し、取得したURLを自動でWorkersに送信します。
 * 
 * 使い方:
 * npm run tunnel:auto
 */

const { spawn } = require('child_process');
const https = require('https');
const http = require('http');

const WORKERS_URL = process.env.WORKERS_URL || 'https://music.haka01xx.workers.dev/tunnel';
const SERVER_PORT = process.env.PORT || 3000;

console.log('🚀 自動トンネル起動スクリプト');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Cloudflare Tunnelを起動
console.log('📡 Cloudflare Tunnelを起動中...');
const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${SERVER_PORT}`], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelUrl = null;

// 標準出力を監視してURLを抽出
tunnel.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // トンネルURLを抽出（例: https://abc-def-123.trycloudflare.com）
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (urlMatch && !tunnelUrl) {
    tunnelUrl = urlMatch[0];
    console.log('');
    console.log('✅ トンネルURL取得:', tunnelUrl);
    console.log('');
    
    // WorkersにURLを送信
    syncTunnelUrl(tunnelUrl);
  }
});

tunnel.stderr.on('data', (data) => {
  console.error(data.toString());
});

tunnel.on('close', (code) => {
  console.log('');
  console.log(`❌ トンネルが終了しました (code: ${code})`);
  process.exit(code);
});

// Ctrl+Cで終了
process.on('SIGINT', () => {
  console.log('');
  console.log('⏹️  トンネルを停止中...');
  tunnel.kill();
  process.exit(0);
});

// WorkersにURLを送信
function syncTunnelUrl(url) {
  console.log('⏳ WorkersにURLを送信中...');
  
  const postData = JSON.stringify({
    url: url,
    timestamp: new Date().toISOString()
  });

  const urlObj = new URL(WORKERS_URL);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const client = urlObj.protocol === 'https:' ? https : http;

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
        console.log('✨ 準備完了！');
        console.log('');
        console.log('📱 iPadのPWAを開いて音楽を楽しんでください');
        console.log('🔗 トンネルURL:', tunnelUrl);
        console.log('');
        console.log('⏹️  停止するには Ctrl+C を押してください');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else {
        console.error(`❌ エラー: HTTPステータス ${res.statusCode}`);
        console.error('レスポンス:', data);
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
  });

  req.write(postData);
  req.end();
}
