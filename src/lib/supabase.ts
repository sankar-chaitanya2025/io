import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a dummy client for build time if env vars are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side during build - return dummy client
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

export type User = {
  id: string;
  email: string;
  alias: string;
  gender: 'dude' | 'girl';
  created_at: string;
  last_active: string;
  is_online: boolean;
};

export type ChatSession = {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'ended' | 'rated';
  started_at: string;
  ended_at: string | null;
};

export type Message = {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type Rating = {
  id: string;
  session_id: string;
  rater_id: string;
  rating: number;
  created_at: string;
};
