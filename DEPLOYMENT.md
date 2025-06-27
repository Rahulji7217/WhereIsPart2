# Deployment Guide for WhereIsPart2

## Quick Netlify Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit: WhereIsPart2 YouTube Series Discovery"
git push origin main
```

### Step 2: Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and authorize
4. Select your `whereispart2` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### Step 3: Environment Variables
Add these in Netlify Dashboard → Site Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_API_KEY=your_hugging_face_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### Step 4: Deploy
Click "Deploy site" and wait for the build to complete!

## Required API Keys

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your URL and anon key

### 2. YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the key to YouTube Data API

### 3. Hugging Face API
1. Go to [huggingface.co](https://huggingface.co)
2. Create account and go to Settings
3. Create a new Access Token
4. Copy the token

## Database Setup

The app will automatically create the required tables when you first connect to Supabase. The schema includes:

- `shorts_data`: Video embeddings and metadata
- `feedback_data`: User feedback for AI training

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Ensure Node.js version is 18+
- Verify all API keys are valid

### Runtime Errors
- Check browser console for API errors
- Verify Supabase connection
- Test API keys individually

### Performance Issues
- Enable Netlify's asset optimization
- Check API rate limits
- Monitor Supabase usage

## Custom Domain (Optional)

1. In Netlify Dashboard → Domain Settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

## Monitoring

- Netlify Analytics: Built-in traffic monitoring
- Supabase Dashboard: Database usage and performance
- Browser DevTools: Client-side performance

Your app will be live at: `https://your-site-name.netlify.app`