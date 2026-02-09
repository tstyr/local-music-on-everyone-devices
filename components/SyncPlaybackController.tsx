'use client';

// Cloudflare Pages版ではSocket.ioは使用しません
// 同期再生機能は無効化されています

interface SyncPlaybackControllerProps {
  audioElement: HTMLAudioElement | null;
}

export default function SyncPlaybackController({ audioElement }: SyncPlaybackControllerProps) {
  // 何もしない（互換性のため残す）
  return null;
}
