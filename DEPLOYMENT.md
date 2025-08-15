# Deployment Guide

This guide covers how to deploy the AI Caption Generator to various platforms.

## 🚀 Quick Deployment Options

### 1. Backend Deployment (Railway/Render/Heroku)

#### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will automatically detect and deploy your Node.js app

#### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

#### Heroku

1. Install Heroku CLI
2. Login and create new app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set VARIABLE_NAME=value`
4. Deploy: `git push heroku main`

### 2. Frontend Deployment (Vercel/Netlify)

#### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. In frontend directory: `vercel`
3. Follow the prompts
4. Set environment variables in Vercel dashboard

#### Netlify

1. Build the frontend: `cd frontend && npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Or connect GitHub repository for automatic deployments

### 3. Database (MongoDB Atlas)

1. Create account at https://cloud.mongodb.com
2. Create a new cluster
3. Add database user and whitelist IP addresses
4. Get connection string and update MONGO_URI

## 🔧 Environment Variables for Production

### Backend Environment Variables

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-caption-generator
JWT_SECRET=your-production-jwt-secret-very-long-and-random
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
GOOGLE_API_KEY=your_google_ai_api_key
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 📱 Full-Stack Deployment with Docker

### 1. Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      # ... other env vars
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## ⚡ Performance Optimizations for Production

### Backend Optimizations

1. **Enable compression**:

   ```javascript
   const compression = require("compression");
   app.use(compression());
   ```

2. **Add caching headers**:

   ```javascript
   app.use("/api", (req, res, next) => {
     res.set("Cache-Control", "no-cache");
     next();
   });
   ```

3. **Database connection pooling** (already configured in Mongoose)

### Frontend Optimizations

1. **Build optimization** (already configured in Vite)
2. **Asset compression**
3. **CDN for static assets**

## 🔒 Security Checklist for Production

- [ ] Change all default passwords and secrets
- [ ] Use HTTPS for all communications
- [ ] Set secure environment variables
- [ ] Configure CORS for specific domains
- [ ] Enable rate limiting (already implemented)
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Backup database regularly

## 📊 Monitoring and Analytics

### 1. Application Monitoring

- Use services like New Relic, DataDog, or Sentry
- Monitor API response times and error rates
- Set up alerts for downtime

### 2. Database Monitoring

- MongoDB Atlas provides built-in monitoring
- Track query performance and index usage
- Set up backup schedules

### 3. User Analytics

- Integrate Google Analytics or similar
- Track user engagement and feature usage
- Monitor conversion rates

## 🚨 Troubleshooting Common Issues

### Backend Issues

1. **Port already in use**: Change PORT environment variable
2. **Database connection failed**: Check MONGO_URI and network access
3. **ImageKit errors**: Verify API keys and permissions
4. **CORS errors**: Update FRONTEND_URL environment variable

### Frontend Issues

1. **API connection failed**: Check VITE_API_URL
2. **Build failures**: Clear node_modules and reinstall
3. **Deployment issues**: Verify build output and serve configuration

### Database Issues

1. **Connection timeout**: Check IP whitelist in MongoDB Atlas
2. **Authentication failed**: Verify username and password
3. **Slow queries**: Add appropriate indexes

## 📞 Support

For deployment issues:

1. Check the troubleshooting section above
2. Review application logs
3. Verify all environment variables are set correctly
4. Test API endpoints individually

Remember to test thoroughly in a staging environment before deploying to production!
