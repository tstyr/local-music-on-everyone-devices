// Cloudflare Pages版ではSocket.ioは使用しません
// 静的エクスポートのため、リアルタイム同期機能は無効化されています

export function useSocket(onLibraryUpdate?: (data: any) => void) {
  // 何もしない（互換性のため関数は残す）
  return {
    socket: null,
    setAudioElement: () => {},
    requestSyncPlay: () => {},
    requestSyncNextTrack: () => {},
    performTimeSync: () => {}
  };
}
