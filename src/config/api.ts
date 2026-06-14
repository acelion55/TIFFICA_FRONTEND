// Centralized API configuration
// Use environment variable or default to localhost in development

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5005/ws';
