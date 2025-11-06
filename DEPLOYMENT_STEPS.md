# 🚀 IO Chat - Deployment Steps

## ✅ Completed
- [x] Dependencies installed (`npm install`)
- [x] Environment variables configured (`.env.local`)
- [x] Build successful (`npm run build`)

## 📋 Next Steps (Do These Now)

### Step 1: Set Up Supabase Database (5 minutes)

1. **Go to your Supabase project**: https://orxlpzwnjrbkkwqukgmx.supabase.co
2. **Click on "SQL Editor"** in the left sidebar
3. **Click "New query"**
4. **Copy the entire contents** of `supabase-setup.sql` file
5. **Paste into the SQL editor**
6. **Click "Run"** to execute
7. **Verify tables created**: Go to "Table Editor" and you should see:
   - users
   - chat_sessions
   - messages
   - ratings

### Step 2: Enable Realtime (2 minutes)

1. **Go to "Database" > "Replication"** in Supabase
2. **Enable replication** for these tables:
   - ✅ `messages` (critical for live chat)
   - ✅ `users` (for online status)
3. **Click "Save"**

### Step 3: Configure Email Authentication (3 minutes)

1. **Go to "Authentication" > "Providers"**
2. **Click on "Email"**
3. **Enable these options**:
   - ✅ Enable Email provider
   - ✅ Enable Email OTP (magic links)
4. **Configure Email Templates** (optional but recommended):
   - Go to "Email Templates" > "Magic Link"
   - Customize the email if you want
5. **Save changes**

### Step 4: Test Locally (5 minutes)

```bash
# Start the development server
npm run dev

# Open in browser
# http://localhost:3000
```

**Test Flow:**
1. Click "Start the Chaos" on landing page
2. Enter your @rguktn.ac.in email
3. Check your email for magic link
4. Click the link to verify
5. Select gender (dude/girl)
6. Generate and select an alias
7. You should reach the dashboard

### Step 5: Deploy to Vercel (10 minutes)

#### A. Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### B. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://orxlpzwnjrbkkwqukgmx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeGxwenduanJia2t3cXVrZ214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDg0NTYsImV4cCI6MjA3ODAyNDQ1Nn0.-yK8U4_pP4JelkpFL0_XfS5eB395KUPbpgZUBVmWyws
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN=rguktn.ac.in
   RESEND_API_KEY=re_BoakkCBR_Ds6dmABkwvAmMxodijqimqZ3
   ```
5. Click "Deploy"
6. Wait for deployment to complete (~2 minutes)

#### C. Update Supabase Auth Settings
1. Go back to Supabase Dashboard
2. **Go to "Authentication" > "URL Configuration"**
3. **Add your Vercel URL** to "Site URL": `https://your-app.vercel.app`
4. **Add to "Redirect URLs"**:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local testing)
5. **Save changes**

### Step 6: Final Testing (5 minutes)

1. Open your Vercel deployment URL
2. Test the complete flow:
   - Landing page loads
   - Email verification works
   - Onboarding completes
   - Dashboard accessible
   - Can find matches (if multiple users online)
   - Messages send and receive in real-time

## 🎯 Post-Deployment

### Share with Your People
- Share the Vercel URL with RGUKTN students
- They need to use their @rguktn.ac.in email
- Monitor the Supabase dashboard for activity

### Monitor Usage
- **Supabase Dashboard**: Check "Database" > "Table Editor" to see users
- **Vercel Analytics**: Monitor traffic and performance
- **Supabase Logs**: Check for any errors

## 🔧 Troubleshooting

### Magic Links Not Working
- Check Supabase email settings
- Verify email domain in `.env.local`
- Check spam folder

### Real-time Messages Not Working
- Ensure Realtime is enabled for `messages` table
- Check browser console for errors
- Verify Supabase URL and keys are correct

### Users Can't Match
- Need at least 2 users online with opposite genders
- Check "users" table in Supabase to verify `is_online` status

## 📊 Current Configuration

- **Supabase Project**: https://orxlpzwnjrbkkwqukgmx.supabase.co
- **Email Domain**: @rguktn.ac.in
- **Framework**: Next.js 16
- **Hosting**: Vercel (recommended)
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Auth**: Supabase Email OTP

## 🎉 You're Almost There!

**Estimated time remaining**: 25 minutes

Just follow Steps 1-6 above and your app will be live!
