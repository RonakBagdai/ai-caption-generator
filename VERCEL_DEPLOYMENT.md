# Vercel Deployment Guide for AI Caption Generator

## Complete Step-by-Step Vercel Deployment

### Prerequisites ✅
- GitHub repository with your project
- Vercel account (free tier available)
- Environment variables ready

### Step 1: Prepare Your Project Structure

Your project should already have these files configured:
```
Day-136/
├── frontend/          # React app (will be deployed as static site)
├── src/              # Backend API (will be serverless functions)
├── api/              # Vercel serverless function entry
├── vercel.json       # Vercel configuration
├── package.json      # Root package.json with vercel-build script
└── server.js         # Modified for Vercel compatibility
```

### Step 2: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### Step 3: Deploy via Vercel Dashboard (Easiest Method)

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Sign in with GitHub

2. **Import Your Project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository: `sheryians-project-exercise`
   - Set Root Directory to: `Day-136`

3. **Configure Build Settings**
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

4. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_API_KEY=your_google_gemini_api_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 4: Deploy via Vercel CLI (Alternative Method)

1. **Login to Vercel**
   ```bash
   cd Day-136
   vercel login
   ```

2. **Configure Environment Variables**
   ```bash
   vercel env add NODE_ENV
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add GOOGLE_API_KEY
   vercel env add IMAGEKIT_PUBLIC_KEY
   vercel env add IMAGEKIT_PRIVATE_KEY
   vercel env add IMAGEKIT_URL_ENDPOINT
   vercel env add CORS_ORIGIN
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Step 5: Verify Deployment

1. **Check Frontend**
   - Visit your Vercel app URL
   - Verify React app loads correctly
   - Test user interface functionality

2. **Check Backend API**
   - Test API endpoints: `https://your-app.vercel.app/api/users/register`
   - Verify database connection
   - Test image upload and AI caption generation

3. **Test Full Workflow**
   - Register/Login
   - Upload image
   - Generate caption
   - Verify all features work

### Step 6: Domain Configuration (Optional)

1. **Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS settings as instructed

### Vercel Configuration Details

Your `vercel.json` is configured for:
- **Frontend**: Static site deployment from `frontend/dist`
- **Backend**: Serverless functions under `/api/*` routes
- **SPA Support**: All frontend routes redirect to `index.html`
- **API Routes**: Backend routes accessible via `/api/*`

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `GOOGLE_API_KEY` | Google Gemini API key | `your-google-api-key` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | `public_xyz123` |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | `private_xyz123` |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | `https://ik.imagekit.io/yourId` |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://your-app.vercel.app` |

### Troubleshooting Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in `package.json`
   - Ensure build commands are correct

2. **API Not Working**
   - Check serverless function logs
   - Verify environment variables are set
   - Ensure MongoDB connection string is correct

3. **CORS Issues**
   - Update `CORS_ORIGIN` environment variable
   - Check frontend API calls use correct base URL

4. **Static Files Not Loading**
   - Verify build output directory is `frontend/dist`
   - Check if assets are properly bundled

### Post-Deployment Steps

1. **Update Frontend API Base URL**
   - Update your frontend code to use Vercel API URLs
   - Change from `http://localhost:3000` to `https://your-app.vercel.app`

2. **Test All Features**
   - User registration/login
   - Image upload and processing
   - AI caption generation
   - Database operations

3. **Monitor Performance**
   - Check Vercel analytics
   - Monitor serverless function performance
   - Review error logs

### Vercel Advantages for This Project

✅ **Serverless Functions**: Perfect for backend API
✅ **Global CDN**: Fast frontend delivery
✅ **Free SSL**: Automatic HTTPS
✅ **GitHub Integration**: Automatic deployments
✅ **Edge Computing**: Low latency worldwide
✅ **Scalability**: Auto-scaling based on traffic

### Cost Considerations

- **Free Tier**: 100GB bandwidth, 1000 serverless invocations
- **Pro Tier**: $20/month for higher limits
- **Monitor Usage**: Check Vercel dashboard for usage metrics

Your AI Caption Generator is now live on Vercel! 🚀

**Live URLs:**
- Frontend: `https://your-project-name.vercel.app`
- API: `https://your-project-name.vercel.app/api/*`

Need help? Check Vercel documentation or contact support!
