# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Backend API deployed and accessible
- Git repository with your code

## Step 1: Environment Variables

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
VITE_API_URL=https://your-backend-domain.com/api
VITE_API_BASE_URL=https://your-backend-domain.com
```

**Important:** Replace `https://your-backend-domain.com` with your actual backend URL.

## Step 2: Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to Frontend directory
cd Frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variables (from Step 1)
6. Click "Deploy"

## Step 3: Verify Deployment

After deployment:
1. Check that the site loads correctly
2. Test API connections
3. Verify images and videos load properly
4. Test authentication flow

## Step 4: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend allows requests from your Vercel domain

### Build Errors
- Check Node.js version (Vercel uses Node 18.x by default)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Images/Videos Not Loading
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend static file serving configuration
- Ensure backend URL is accessible from browser

## Notes

- Vercel automatically builds on every push to main branch
- Preview deployments are created for pull requests
- Environment variables are encrypted and secure
- Use `.env.local` for local development (not committed to git)














