# 🚀 Deployment Guide: Audio Collection Platform

This guide will help you deploy your audio collection platform to production with HTTPS using Vercel (frontend), Railway (backend), and Firebase (database & storage).

## 📋 Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (free)
- [Railway](https://railway.app) account (free tier available)
- [Firebase](https://firebase.google.com) account (free tier available)
- [Agora](https://agora.io) account (free tier available)

## 🎯 Deployment Steps

### 1. **Prepare Your Code**

Your code is already prepared for deployment with:
- ✅ Environment variable support for production URLs
- ✅ Health check endpoint for Railway
- ✅ Production-ready socket connections
- ✅ HTTPS-compatible configurations

### 2. **Deploy Backend to Railway**

#### Step 2.1: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your repository
6. Set the root directory to `./server`

#### Step 2.2: Configure Environment Variables
In Railway dashboard, add these environment variables:
```
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
PORT=5001
NODE_ENV=production
```

#### Step 2.3: Deploy
1. Railway will automatically detect it's a Node.js project
2. Click "Deploy"
3. Wait for deployment to complete
4. Copy the generated URL (e.g., `https://your-app.railway.app`)

### 3. **Deploy Frontend to Vercel**

#### Step 3.1: Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `./client`

#### Step 3.2: Configure Environment Variables
In Vercel dashboard, add:
```
REACT_APP_SERVER_URL=https://your-railway-app-url.railway.app
```

#### Step 3.3: Deploy
1. Vercel will automatically build and deploy
2. Your app will be available at `https://your-app.vercel.app`

### 4. **Set Up Firebase (Optional - for Production)**

#### Step 4.1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Enable Storage

#### Step 4.2: Configure Firebase
1. Get your Firebase config
2. Add to environment variables if needed

## 🔧 Environment Variables Reference

### Railway (Backend)
```bash
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
PORT=5001
NODE_ENV=production
```

### Vercel (Frontend)
```bash
REACT_APP_SERVER_URL=https://your-railway-app-url.railway.app
```

## 🌐 Production URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
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
- Ensure Railway URL is correct
- Verify CORS settings

#### 2. **Agora Connection Failed**
- Check Agora credentials in Railway
- Verify App ID and Certificate
- Check Agora dashboard for usage

#### 3. **Recording Not Working**
- Check browser console for errors
- Verify HTTPS is working
- Check microphone permissions

## 📊 Monitoring

### Railway Monitoring
- Check Railway dashboard for logs
- Monitor resource usage
- Set up alerts if needed

### Vercel Monitoring
- Check Vercel analytics
- Monitor build status
- Review deployment logs

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain to Vercel
2. **Analytics**: Add Google Analytics
3. **Monitoring**: Set up error tracking (Sentry)
4. **Scaling**: Upgrade Railway plan if needed

## 💰 Cost Estimation

### Free Tier (Recommended for testing):
- **Vercel**: Free (unlimited deployments)
- **Railway**: Free tier available
- **Firebase**: Free tier (generous limits)
- **Agora**: Free tier (10,000 minutes/month)

### Paid Plans (For production):
- **Railway**: $5-20/month
- **Firebase**: Pay-as-you-go
- **Agora**: $0.99 per 1,000 minutes

## 🎉 Success!

Your audio collection platform is now deployed with:
- ✅ **HTTPS** enabled
- ✅ **Real-time audio** streaming
- ✅ **Cross-device** compatibility
- ✅ **Recording coordination** working
- ✅ **Production-ready** infrastructure

**Test it out and enjoy your deployed app!** 🎤✨
