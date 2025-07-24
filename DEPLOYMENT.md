# Deployment Guide - React Router v7 + Convex + Vercel

## Environment Variables Setup

### Required Environment Variables for Vercel

You need to set up the following environment variables in your Vercel project dashboard:

#### 1. Convex Configuration
```bash
# Production Convex Deployment URL
VITE_CONVEX_URL=https://perceptive-coyote-344.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://perceptive-coyote-344.convex.cloud

# Convex Deployment String (from .env.local)
CONVEX_DEPLOYMENT=prod:perceptive-coyote-344

# Convex Deploy Key (generate from Convex Dashboard)
CONVEX_DEPLOY_KEY=your_production_deploy_key_here
```

#### 2. Clerk Authentication
```bash
# Clerk Publishable Key (from .env.local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YWJzb2x1dGUtd3Jlbi02MC5jbGVyay5hY2NvdW50cy5kZXYk

# Clerk Secret Key (from .env.local)
CLERK_SECRET_KEY=sk_test_zBFqJ7OJdPw40NE8Uu08VGRDKn9g2zmsziIxnhaAGd
```

#### 3. Frontend URL Configuration
```bash
# Production Frontend URL (update when deployed)
FRONTEND_URL=https://your-app-name.vercel.app
```

### Deployment Steps

#### 1. Set up Convex Deploy Key
1. Go to your [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to your project: `react-starter-kit-e2ffb`
3. Go to Settings → Deploy Keys
4. Generate a new **Production Deploy Key**
5. Copy the key and add it to Vercel as `CONVEX_DEPLOY_KEY`

#### 2. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Import the project
3. Add all the environment variables listed above
4. Deploy!

The build command in `vercel.json` will automatically:
- Deploy your Convex backend functions
- Build your React Router frontend
- Set up proper environment variables for production

#### 3. Update Frontend URL
After your first deployment:
1. Note your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`)
2. Update the `FRONTEND_URL` environment variable in Vercel
3. Update your Clerk settings to allow this domain
4. Redeploy

### Webhook Configuration

The deployment includes a webhook handler at `/webhook/polar` that forwards Polar.sh payment webhooks to your Convex backend.

Make sure to configure your Polar.sh webhooks to point to:
```
https://your-app-name.vercel.app/webhook/polar
```

### Build Process

The deployment uses the following build process:

1. **Install dependencies**: `npm ci`
2. **Deploy Convex**: `npx convex deploy --cmd 'npm run build'`
   - This deploys your Convex functions first
   - Sets the `VITE_CONVEX_URL` environment variable
   - Then runs the frontend build
3. **Output**: 
   - Client assets to `build/client/`
   - Server bundle to `build/server/*/index.js`

### Troubleshooting

#### Common Issues:

1. **Build fails with "Cannot find server bundle"**
   - This is fixed by the updated `package.json` start script using `./build/server/*/index.js`

2. **Environment variables not found**
   - Make sure all variables are set in Vercel project settings
   - Check that `CONVEX_DEPLOY_KEY` is properly generated from Convex Dashboard

3. **Webhook errors**
   - Verify your Polar.sh webhook URL is correct
   - Check that `VITE_CONVEX_URL` is properly set

4. **Authentication issues**
   - Update Clerk settings to allow your production domain
   - Ensure `FRONTEND_URL` matches your deployed URL

### Local Development

For local development, keep using:
```bash
npm run dev
npx convex dev
```

Your `.env.local` file should remain as-is for development.