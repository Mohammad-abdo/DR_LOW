# Vercel Deployment - Quick Start

## Environment Variables Setup

Create a `.env` file in the Frontend directory (or set in Vercel dashboard):

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_API_BASE_URL=https://your-backend-domain.com
```

## Deploy Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd Frontend
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_URL` and `VITE_API_BASE_URL`

4. **Redeploy** after setting environment variables

## Important Notes

- Replace `https://your-backend-domain.com` with your actual backend URL
- Ensure backend CORS allows your Vercel domain
- Backend must be accessible from the internet
- Images/videos will load from the backend URL you specify


































