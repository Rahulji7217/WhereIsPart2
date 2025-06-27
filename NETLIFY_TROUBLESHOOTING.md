# Netlify Deployment Troubleshooting

## Current Issue: Build Failed with Exit Code 2

This error typically occurs due to:

### 1. Missing Environment Variables ⚠️
**CRITICAL**: You must set these in Netlify Dashboard:

Go to: **Site Settings → Environment Variables** and add:

```
VITE_SUPABASE_URL=https://bnvsuhufekgixvifsdkc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudnN1aHVmZWtnaXh2aWZzZGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQ5MDEsImV4cCI6MjA2NTkzMDkwMX0.VWlBOGJhZGJhZGJhZGJhZGJhZGJhZGJhZGJhZGJhZGI
VITE_HF_API_KEY=your_hugging_face_api_key
VITE_YOUTUBE_API_KEY=AIzaSyB1BMDjqew4Y9XgRcGNN2XLtN-BxJ7AsiA
NODE_ENV=production
CI=true
```

### 2. Build Settings
In Netlify Dashboard → **Site Settings → Build & Deploy**:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 3. Quick Fix Steps

1. **Set Environment Variables** (most important!)
2. **Trigger New Deploy**: 
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

### 4. If Still Failing

Check the build logs for specific errors:
- Missing dependencies
- TypeScript errors
- API key validation issues

### 5. Alternative Build Commands

If the standard build fails, try these in Netlify settings:

```bash
# Option 1: Skip TypeScript checks
npm run build --skip-ts-check

# Option 2: Force clean install
npm ci && npm run build

# Option 3: Ignore warnings
CI=false npm run build
```

### 6. Common Solutions

**Missing API Keys**: The app expects these environment variables. Without them, the build may fail.

**Node Version**: Ensure Node 18+ is selected in build settings.

**Dependencies**: All dependencies should install automatically, but check the build log for npm errors.

### 7. Test Locally First

Before deploying, test the build locally:

```bash
npm run build
npm run preview
```

This will catch most issues before deployment.

---

**Most likely fix**: Add the environment variables listed in step 1! 🔑