# Supabase Authentication Configuration

## 🔧 Configure Redirect URLs in Supabase

### Step 1: Go to Authentication Settings

1. Open your Supabase project: https://orxlpzwnjrbkkwqukgmx.supabase.co
2. Click **"Authentication"** in the left sidebar
3. Click **"URL Configuration"**

### Step 2: Add Redirect URLs

Add these URLs to **"Redirect URLs"** section:

#### For Local Development:
```
http://localhost:3000/**
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3001/**
http://localhost:3001/auth/confirm
http://localhost:3001/auth/callback
```

#### For Production (Vercel):
```
https://io-gold-xi.vercel.app/**
https://io-gold-xi.vercel.app/auth/confirm
https://io-gold-xi.vercel.app/auth/callback
```

### Step 3: Set Site URL

Set the **"Site URL"** to:
- **Local**: `http://localhost:3000`
- **Production**: `https://io-gold-xi.vercel.app/`

### Step 4: Save Changes

Click **"Save"** at the bottom of the page.

## 🧪 Test the Magic Link Flow

1. Start your dev server: `npm run dev`
2. Go to: http://localhost:3000
3. Click "Start the Chaos"
4. Enter your @rguktn.ac.in email
5. Check your email for the magic link
6. Click the link - it should redirect to `/auth/callback` then to `/onboarding/gender`

## ⚠️ Common Issues

### Issue: "Invalid redirect URL"
**Solution**: Make sure you added the exact URLs above to Supabase redirect URLs

### Issue: Magic link redirects but shows error
**Solution**: 
1. Clear browser cookies
2. Make sure `.env.local` has correct `NEXT_PUBLIC_APP_URL`
3. Restart dev server

### Issue: "Email not confirmed"
**Solution**: Check Supabase email settings - make sure email confirmation is enabled

## 📝 What Changed

I've added:
1. **`/src/app/auth/callback/route.ts`** - Handles the OAuth callback from Supabase
2. Updated email redirect to use `/auth/callback?next=/onboarding/gender`

This is the standard Next.js + Supabase authentication flow.

## 🚀 For Vercel Deployment

After deploying to Vercel:
1. Get your Vercel URL (e.g., `https://io-gold-xi.vercel.app/`)
2. Go back to Supabase → Authentication → URL Configuration
3. Add your Vercel URLs to redirect URLs
4. Update Site URL to your Vercel URL
5. Save and test

---

**Note**: The redirect URLs must match EXACTLY. The `**` wildcard allows all paths under that domain.
