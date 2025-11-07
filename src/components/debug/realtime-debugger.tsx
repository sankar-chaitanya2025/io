'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function RealtimeDebugger() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Initialize logs and status in next tick to avoid synchronous setState
    setTimeout(() => {
      const initialLog = `${new Date().toLocaleTimeString()}: Testing realtime connection...`;
      setLogs([initialLog]);
      setStatus('connecting');
    }, 0);

    // Test basic connection
    const testChannel = supabase
      .channel('realtime-test')
      .on('system', {}, (payload) => {
        addLog(`System event: ${JSON.stringify(payload)}`);
      })
      .subscribe((status) => {
        addLog(`Subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setStatus('error');
          addLog('Connection error');
        }
      });

    // Test broadcast
    setTimeout(() => {
      testChannel.send({
        type: 'broadcast',
        event: 'test',
        payload: { message: 'Test message' }
      });
      addLog('Sent test broadcast');
    }, 2000);

    return () => {
      supabase.removeChannel(testChannel);
      addLog('Cleaned up test channel');
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-black/90 border border-white/20 rounded-lg p-4 text-xs font-mono text-white/80 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">Realtime Debug</h3>
        <div className={`w-2 h-2 rounded-full ${
          status === 'connected' ? 'bg-green-500' : 
          status === 'connecting' ? 'bg-yellow-500' : 
          status === 'error' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
      </div>
      <div className="max-h-40 overflow-y-auto space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="text-white/60">{log}</div>
        ))}
      </div>
    </div>
  );
}