# 🚂 Railway Deployment Guide for AI Caption Generator

## 🚀 Quick Start (5 minutes to live!)

### Step 1: Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Connect your GitHub account

### Step 2: Deploy Your Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `ai-caption-generator` repository
4. Railway will auto-detect it's a Node.js app

### Step 3: Add MongoDB Database
1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MongoDB"**
3. Railway will provision a MongoDB instance automatically

### Step 4: Configure Environment Variables
Click on your app service → **"Variables"** tab → Add these:

```env
# Application
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-app.railway.app

# Database (Railway will auto-generate MONGO_URL)
MONGO_URL=${{MongoDB.DATABASE_URL}}

# Your API Keys (from your .env file)
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
```

### Step 5: Deploy Frontend & Backend Together
Railway will automatically:
- Build your Node.js backend
- Serve your React frontend from the `frontend/dist` folder
- Connect to MongoDB
- Generate SSL certificate
- Provide you with a live URL

### Step 6: Build Frontend for Production
Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "node server.js"
  }
}
```

### Step 7: Update Server to Serve Frontend
Your `server.js` should serve the React build files:

```javascript
// Add this to your server.js
const path = require('path');

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});
```

## 🌐 Result
Your app will be live at: `https://your-app.railway.app`

## 💰 Pricing
- **Free Tier**: $5 credit monthly (sufficient for development)
- **Pro**: $20/month (for production apps)

## 🔧 Advanced Features
- **Custom Domain**: Add your own domain
- **Auto-scaling**: Handles traffic spikes
- **Monitoring**: Built-in logs and metrics
- **Rollbacks**: Easy deployment rollbacks
- **GitHub Integration**: Auto-deploys on push

## 🆘 Need Help?
- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Their Discord community is very helpful!
