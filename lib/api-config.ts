// API接続設定の管理

const API_URL_KEY = 'music_server_api_url';
const TUNNEL_URL_KEY = 'music_server_tunnel_url';
const WORKERS_URL = 'https://music.haka01xx.workers.dev/tunnel';
const DEFAULT_API_URL = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Workersから最新のトンネルURLを取得
 */
export async function fetchLatestTunnelUrl(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch(WORKERS_URL);
    if (!response.ok) throw new Error('Failed to fetch tunnel URL');
    
    const data = await response.json();
    if (data.url) {
      // 取得したURLをキャッシュ
      localStorage.setItem(TUNNEL_URL_KEY, data.url);
      localStorage.setItem(API_URL_KEY, data.url);
      console.log('[API Config] Tunnel URL updated:', data.url);
      return data.url;
    }
  } catch (error) {
    console.error('[API Config] Failed to fetch tunnel URL:', error);
  }
  
  return null;
}

/**
 * APIのベースURLを取得
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_API_URL;
  }

  // localStorageから取得
  const savedUrl = localStorage.getItem(API_URL_KEY);
  if (savedUrl) {
    return savedUrl;
  }

  // デフォルトは現在のオリジン
  return DEFAULT_API_URL;
}

/**
 * APIのベースURLを設定
 */
export function setApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  
  // URLの正規化（末尾のスラッシュを削除）
  const normalizedUrl = url.replace(/\/$/, '');
  localStorage.setItem(API_URL_KEY, normalizedUrl);
}

/**
 * 保存されたAPIのURLをクリア
 */
export function clearApiUrl(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_URL_KEY);
}

/**
 * APIのURLが設定されているかチェック
 */
export function hasCustomApiUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(API_URL_KEY);
}

/**
 * フルAPIパスを構築
 */
export function buildApiPath(path: string): string {
  const baseUrl = getApiUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * fetch用のヘルパー関数
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = buildApiPath(path);
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // クッキーを含める
  };

  return fetch(url, defaultOptions);
}

/**
 * アプリ起動時にトンネルURLを自動更新
 */
export async function initializeApiConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  console.log('[API Config] Initializing API connection...');
  
  // 既存のURLをチェック
  const existingUrl = localStorage.getItem(API_URL_KEY);
  console.log('[API Config] Existing URL:', existingUrl);
  
  // Workersから最新のURLを取得
  const latestUrl = await fetchLatestTunnelUrl();
  
  if (latestUrl) {
    console.log('[API Config] Using latest tunnel URL:', latestUrl);
  } else if (existingUrl) {
    console.log('[API Config] Using cached URL:', existingUrl);
  } else {
    console.log('[API Config] No URL available, using default');
  }
}
