#!/usr/bin/env node

/**
 * Cloudflare Pages用クリーンアップスクリプト
 * 
 * 静的エクスポートに不要なファイルを削除します。
 * 
 * 使い方:
 * node scripts/cleanup-for-pages.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cloudflare Pages用クリーンアップスクリプト');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// 削除するファイル・ディレクトリのリスト
const itemsToDelete = [
  // APIルート
  'app/api',
  
  // Prisma関連
  'prisma',
  'lib/prisma.ts',
  
  // 認証関連
  'lib/auth.ts',
  
  // サーバーサイド機能
  'lib/music-scanner.ts',
  'lib/system-info.ts',
  'lib/socket.ts',
  
  // Electron関連
  'electron',
  'types/electron.d.ts',
  
  // サーバー設定
  'server.js',
  
  // 環境変数（オプション）
  // '.env',
  
  // ページ（不要な場合）
  'pages/api',
  'app/admin',
  'app/upload/page.tsx',
];

let deletedCount = 0;
let skippedCount = 0;

itemsToDelete.forEach(item => {
  const itemPath = path.join(process.cwd(), item);
  
  try {
    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`✅ ディレクトリを削除: ${item}`);
      } else {
        fs.unlinkSync(itemPath);
        console.log(`✅ ファイルを削除: ${item}`);
      }
      
      deletedCount++;
    } else {
      console.log(`⏭️  スキップ（存在しない）: ${item}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ エラー: ${item} - ${error.message}`);
  }
});

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✨ 完了: ${deletedCount}件削除, ${skippedCount}件スキップ`);
console.log('');
console.log('📝 次のステップ:');
console.log('1. npm install で依存関係を更新');
console.log('2. npm run build でビルド');
console.log('3. Cloudflare Pagesにデプロイ');
console.log('');
