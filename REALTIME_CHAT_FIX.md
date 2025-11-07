# 🚨 Real-Time Chat Fix Guide

If your real-time chat is not working, follow these steps exactly:

## Step 1: Check Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN=rguktn.ac.in
```

**Important:** Get these from your Supabase dashboard → Settings → API

## Step 2: Enable Realtime in Supabase

1. Go to your Supabase project
2. Navigate to **Realtime** in the sidebar
3. If disabled, click **Enable**
4. Click on the **Realtime** row to expand
5. **Enable realtime for:**
   - ✅ `messages` (REQUIRED for chat)
   - ✅ `users` (for online status)
6. Click **Save**

## Step 3: Update Database

Run this SQL in Supabase SQL Editor:

```sql
-- Create publication for realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE messages, users;

-- Grant replication permissions
GRANT SELECT ON messages TO authenticated;
GRANT SELECT ON users TO authenticated;
```

## Step 4: Verify Setup

1. Start development server: `npm run dev`
2. Open browser console (F12)
3. You should see a "Realtime Debug" panel in bottom-right
4. Status should show "connected" with green dot
5. If red, check environment variables and Supabase settings

## Step 5: Test Real-time Chat

1. Open two browser windows (or incognito)
2. Complete onboarding for both users
3. Start a chat session
4. Send message in one window
5. Message should appear instantly in both windows

## Common Issues

### ❌ "Subscription status: CHANNEL_ERROR"
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
- Ensure Realtime is enabled in Supabase

### ❌ Messages don't sync between windows
- Ensure `messages` table has realtime enabled
- Check RLS policies don't block access
- Run the SQL from Step 3

### ❌ No users available for matching
- Ensure both users are marked as online
- Check users have opposite genders
- Verify is_online field is true in database

## Debug Mode

The app includes a real-time debugger that appears in development mode. It shows:
- Connection status
- Subscription events
- Test broadcasts

Use this to troubleshoot connection issues.

## Still Not Working?

1. Check browser console for WebSocket errors
2. Verify no ad blockers are blocking WebSocket connections
3. Try incognito mode
4. Check if your internet connection blocks WebSocket
5. Restart both the dev server and browser

## Quick Test

Open browser console and run:

```javascript
import { createClient } from '@supabase/supabase-js'
const client = createClient('YOUR_URL', 'YOUR_ANON_KEY')
const channel = client.channel('test')
  .on('broadcast', { event: 'test' }, console.log)
  .subscribe(status => console.log('Status:', status))
```

You should see "Status: SUBSCRIBED" if everything works.