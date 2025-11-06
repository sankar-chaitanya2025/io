import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
