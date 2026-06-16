// Centralized API configuration
// Prefer NEXT_PUBLIC_API_URL when set. Ensure it includes `/api` suffix.
const rawApi = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';
const normalized = rawApi.endsWith('/api') ? rawApi.replace(/\/$/, '') : rawApi.replace(/\/$/, '') + '/api';
export const API_URL = normalized;

// WebSocket URL: prefer NEXT_PUBLIC_WS_URL or derive from API_URL
const rawWs = process.env.NEXT_PUBLIC_WS_URL || '';
export const WS_URL = rawWs || (API_URL.startsWith('https') ? API_URL.replace(/^https/, 'wss').replace(/\/api$/, '/ws') : API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws'));
