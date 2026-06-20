'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tifficaapp-1.onrender.com/api';

export function useLiveCount() {
  const { user, token } = useAuth();
  const [liveCount, setLiveCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin || !token) return;

    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [isAdmin, token]);

  const setupWebSocket = () => {
    if (!token) return;

    try {
      // Use the Render backend URL for WebSockets since Vercel does not support them
      const wsHost = API_URL.replace('http', 'ws').replace('/api', '');
      wsRef.current = new WebSocket(`${wsHost}/admin-notifications`);

      wsRef.current.onopen = () => {
        console.log('✅ Live count WebSocket connected');
        setIsConnected(true);
        
        // Send authentication
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          token: token
        }));

        // Setup heartbeat to keep connection alive
        heartbeatRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Every 30 seconds
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'auth_success') {
            console.log('✅ Live count WebSocket authenticated');
            return;
          }
          
          if (data.type === 'live_user_count') {
            console.log(`📊 Received live count update: ${data.count} users`);
            setLiveCount(data.count || 0);
          }
        } catch (error) {
          console.error('Live count WebSocket message error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn('Live count WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('🔌 Live count WebSocket disconnected');
        setIsConnected(false);
        
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
        
        // Reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
      };
    } catch (error) {
      console.warn('Failed to setup live count WebSocket:', error);
      setIsConnected(false);
      // Retry after 5 seconds
      setTimeout(setupWebSocket, 5000);
    }
  };

  return {
    liveCount,
    isConnected
  };
}