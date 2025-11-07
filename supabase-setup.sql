-- IO Chat Database Setup
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    alias VARCHAR(100) NOT NULL DEFAULT '',
    gender VARCHAR(20) CHECK (gender IN ('dude', 'girl')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    rater_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_users ON chat_sessions(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online) WHERE is_online = true;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can update own record" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- RLS Policies for chat_sessions table
CREATE POLICY "Users can view own sessions" ON chat_sessions
    FOR SELECT TO authenticated
    USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create sessions" ON chat_sessions
    FOR INSERT TO authenticated
    WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON chat_sessions
    FOR UPDATE TO authenticated
    USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS Policies for messages table (IMPORTANT for Realtime)
CREATE POLICY "Users can view messages from their sessions" ON messages
    FOR SELECT TO authenticated
    USING (
        session_id IN (
            SELECT id FROM chat_sessions 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their sessions" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        session_id IN (
            SELECT id FROM chat_sessions 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- RLS Policies for ratings table
CREATE POLICY "Users can view ratings from their sessions" ON ratings
    FOR SELECT TO authenticated
    USING (
        session_id IN (
            SELECT id FROM chat_sessions 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ratings for their sessions" ON ratings
    FOR INSERT TO authenticated
    WITH CHECK (
        rater_id = auth.uid() AND
        session_id IN (
            SELECT id FROM chat_sessions 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Realtime Setup
-- Create publication for realtime (if it doesn't exist)
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE messages, users;

-- Grant replication permissions (required for realtime)
GRANT SELECT ON messages TO authenticated;
GRANT SELECT ON users TO authenticated;

-- Optional: Create function to clean up old sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $
BEGIN
    -- End sessions that have been active for more than 24 hours
    UPDATE chat_sessions 
    SET status = 'ended', ended_at = NOW() 
    WHERE status = 'active' 
    AND started_at < NOW() - INTERVAL '24 hours';
END;
$ LANGUAGE plpgsql;
