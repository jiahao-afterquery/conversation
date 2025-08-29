# 🚀 Render.com Deployment Guide

Since Railway's free tier only allows database deployments, we'll use Render.com for the backend deployment.

## 📋 Prerequisites

- [GitHub](https://github.com) account
- [Render.com](https://render.com) account (free)
- [Vercel](https://vercel.com) account (free)
- [Agora](https://agora.io) account (free tier available)

## 🎯 Deployment Steps

### 1. **Deploy Backend to Render.com**

#### Step 1.1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

#### Step 1.2: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub account
3. Select repository: `jiahao-afterquery/conversation`
4. Configure the service:
   - **Name**: `audio-platform-backend`
   - **Root Directory**: `./server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

#### Step 1.3: Add Environment Variables
In Render dashboard, add these environment variables:
```
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
PORT=5001
NODE_ENV=production
```

#### Step 1.4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy the generated URL (e.g., `https://audio-platform-backend.onrender.com`)

### 2. **Deploy Frontend to Vercel**

#### Step 2.1: Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `jiahao-afterquery/conversation`
4. Set the root directory to `./client`

#### Step 2.2: Configure Environment Variables
In Vercel dashboard, add:
```
REACT_APP_SERVER_URL=https://your-render-app-url.onrender.com
```

#### Step 2.3: Deploy
1. Vercel will automatically build and deploy
2. Your app will be available at `https://your-app.vercel.app`

## 🔧 Environment Variables Reference

### Render.com (Backend)
```bash
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
PORT=5001
NODE_ENV=production
```

### Vercel (Frontend)
```bash
REACT_APP_SERVER_URL=https://your-render-app-url.onrender.com
```

## 🌐 Production URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.onrender.com`
- **HTTPS**: ✅ Enabled by default on both platforms

## 🎤 Testing Production

### 1. **Test Real-time Audio**
- Open your Vercel URL on two different devices
- Join the platform on both
- Start a conversation
- Test voice communication

### 2. **Test Recording**
- Start recording on one device
- Verify both devices show "Recording Active"
- Stop recording and check file uploads

### 3. **Test Cross-Device**
- Use different browsers/devices
- Test on mobile (HTTPS will work!)
- Verify all functionality works

## 🔍 Troubleshooting

### Common Issues:

#### 1. **Socket Connection Failed**
- Check `REACT_APP_SERVER_URL` in Vercel
- Ensure Render URL is correct
- Verify CORS settings

#### 2. **Agora Connection Failed**
- Check Agora credentials in Render
- Verify App ID and Certificate
- Check Agora dashboard for usage

#### 3. **Recording Not Working**
- Check browser console for errors
- Verify HTTPS is working
- Check microphone permissions

## 📊 Monitoring

### Render.com Monitoring
- Check Render dashboard for logs
- Monitor resource usage
- Set up alerts if needed

### Vercel Monitoring
- Check Vercel analytics
- Monitor build status
- Review deployment logs

## 💰 Cost Estimation

### Free Tier (Recommended for testing):
- **Vercel**: Free (unlimited deployments)
- **Render.com**: Free (750 hours/month)
- **Agora**: Free tier (10,000 minutes/month)

### Paid Plans (For production):
- **Render.com**: $7/month for unlimited
- **Agora**: $0.99 per 1,000 minutes

## 🎉 Success!

Your audio collection platform is now deployed with:
- ✅ **HTTPS** enabled
- ✅ **Real-time audio** streaming
- ✅ **Cross-device** compatibility
- ✅ **Recording coordination** working
- ✅ **Production-ready** infrastructure

**Test it out and enjoy your deployed app!** 🎤✨
