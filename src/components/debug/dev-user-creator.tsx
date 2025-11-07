'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateAlias } from '@/lib/names';

export function DevUserCreator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createTestUser = async (gender: 'dude' | 'girl') => {
    setLoading(true);
    setResult('');

    try {
      const timestamp = Date.now();
      const email = `test${gender}${timestamp}@rguktn.ac.in`;
      const alias = generateAlias();
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: 'test123456',
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) throw authError;

      // Create user record
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            alias,
            gender,
            is_online: true,
            last_active: new Date().toISOString()
          });

        if (userError) throw userError;

        setResult(`Created ${gender} user: ${alias} (${email})`);
      }
    } catch (err) {
      setResult(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 w-80 bg-black/90 border border-white/20 rounded-lg p-4 text-xs font-mono text-white/80 z-50">
      <h3 className="text-white font-bold mb-2">Dev: Create Test Users</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => createTestUser('dude')}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-white"
        >
          Create Test Dude
        </button>
        
        <button
          onClick={() => createTestUser('girl')}
          disabled={loading}
          className="w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 rounded text-white"
        >
          Create Test Girl
        </button>
      </div>

      {loading && <div className="mt-2 text-yellow-400">Creating user...</div>}
      {result && <div className="mt-2 text-green-400 whitespace-pre-wrap">{result}</div>}
    </div>
  );
}