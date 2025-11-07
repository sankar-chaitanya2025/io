# Supabase Setup Guide for IO Chat

This document guides you through setting up Supabase for the IO Chat application.

## Prerequisites

- Supabase account (create at https://supabase.com)
- Node.js 18+ and npm installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New project" and fill in the details:
   - Project name: `io-chat`
   - Database password: Create a strong password
   - Region: Choose closest to your users
3. Click "Create new project" and wait for it to initialize

## Step 2: Create Database Tables

Once your project is ready:

1. Go to the SQL Editor in your Supabase dashboard
2. Click "New query" and paste the following SQL:

```sql
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
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_sessions_users ON chat_sessions(user1_id, user2_id);
CREATE INDEX idx_users_online ON users(is_online) WHERE is_online = true;
```

3. Click "Run" to execute the SQL

## Step 3: Enable Realtime (Critical for Chat Functionality)

1. Go to "Realtime" in your Supabase dashboard
2. If Realtime is disabled, click "Enable" 
3. Click on the "Realtime" row to expand the settings
4. **IMPORTANT**: Enable realtime for these specific tables:
   - ✅ `messages` (required for real-time chat)
   - ✅ `users` (required for online status updates)
   - ❌ `chat_sessions` (not needed)
   - ❌ `ratings` (not needed)

5. Click "Save" to apply the changes

**Verification**: After enabling, you should see a green "Enabled" status for the selected tables.

## Step 4: Configure Authentication

1. Go to "Authentication" > "Providers"
2. Make sure "Email" provider is enabled
3. Click on "Email" to configure:
   - Enable "Email OTP" (magic links)
   - Set email templates if needed

4. Go to "Settings" > "Auth"
5. Under "Email Auth", configure:
   - Auto Confirm Email: OFF (require magic link confirmation)
   - Double Confirm Changes: OFF

## Step 5: Get Your API Keys

1. Go to "Settings" > "API"
2. Find and copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon Key (the public key)

## Step 6: Environment Configuration

1. In your project root, update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN=rguktn.ac.in
```

Replace the values with your actual Supabase credentials.

## Step 7: Configure Row Level Security (RLS)

For production, you should enable RLS policies. In Supabase:

1. Go to "Authentication" > "Policies"
2. For each table (users, messages, chat_sessions, ratings), add policies

Basic policy examples:

**Users table - SELECT own record:**
```sql
CREATE POLICY "Users can select own record"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

**Messages table - SELECT own session messages:**
```sql
CREATE POLICY "Users can select messages from their sessions"
ON messages
FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);
```

## Step 8: Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Testing

1. Open two browser windows (or use incognito)
2. Register with two different college emails
3. Complete onboarding flow
4. Test matchmaking and messaging

## Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)

4. Update Supabase Auth settings:
   - Go to "Authentication" > "URL Configuration"
   - Add your Vercel production URL to "Redirect URLs"

## Troubleshooting

### Magic links not working:
- Check SMTP configuration in Supabase
- Verify email domain is correct in `.env.local`
- Ensure redirect URLs are configured in Auth settings

### **Real-time chat not working:**
1. **Check Supabase Realtime Settings:**
   - Go to Realtime dashboard and verify it's enabled
   - Ensure `messages` table has realtime enabled
   - Check for any error messages in the Realtime logs

2. **Check Browser Console:**
   - Look for WebSocket connection errors
   - Check for authentication errors
   - Verify no CORS issues

3. **Verify Environment Variables:**
   ```bash
   # Check that these are correctly set
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Test Realtime Connection:**
   Open browser console and run:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   const client = createClient('YOUR_URL', 'YOUR_ANON_KEY')
   const channel = client.channel('test')
     .on('broadcast', { event: 'test' }, console.log)
     .subscribe()
   ```

5. **Check RLS Policies:**
   - Ensure RLS policies don't block realtime subscriptions
   - Temporarily disable RLS for testing if needed

6. **Network Issues:**
   - Check if WebSocket connections are blocked by firewall
   - Verify your browser supports WebSocket connections
   - Try incognito mode to rule out extension conflicts

### Authentication failing:
- Clear browser cookies and cache
- Verify Supabase URL and keys are correct
- Check CORS settings in Supabase

### Database connection issues:
- Verify database URL format
- Check database credentials
- Ensure database is running and accessible

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime Guide](https://supabase.com/docs/realtime/overview)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
