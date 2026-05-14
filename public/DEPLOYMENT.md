# DMflow Deployment Guide

To deploy this SaaS application correctly and avoid a "white blank screen," please follow these steps:

## 1. Environment Variables
You **MUST** set the following environment variables in your deployment tool (Vercel, Netlify, Render, etc.):

- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
- `INSTAGRAM_CLIENT_ID`: Your Instagram App Client ID (from Meta for Developers). **Must be a "Business" app type.**
- `INSTAGRAM_CLIENT_SECRET`: Your Instagram App Client Secret.
- `APP_URL`: The full URL of your deployed app (e.g., `https://your-app.vercel.app`).
- `NODE_ENV`: Set to `production`.

## 2. Deployment Tool Settings

### Render (Recommended for Full-Stack)
- **Service Type**: Web Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Vercel
- The app is pre-configured with `vercel.json` to handle the Express backend and Vite frontend.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- Note: The Express backend will not run on Netlify without additional configuration (Netlify Functions). For full functionality, use Render or Vercel.

## 3. Troubleshooting "White Blank Screen"
- Check the browser console (F12) for errors.
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set. If these are missing during the build, the app will crash on startup.
- Ensure you have run `npm run build` before starting the server.
