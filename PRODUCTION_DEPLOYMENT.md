# 🚀 Production Deployment Guide

## 📋 **Overview**

This guide will help you deploy your audio collection platform to production with:
- **Cloud hosting** for reliability and scalability
- **Cloud storage** for audio files
- **Database** for persistent data
- **Environment variables** for security

## 🌐 **Recommended Hosting Stack**

### **Option 1: Vercel + Railway (Recommended)**
- **Frontend**: Vercel (React app)
- **Backend**: Railway (Node.js server)
- **Database**: MongoDB Atlas
- **Storage**: AWS S3

### **Option 2: Heroku (All-in-one)**
- **Full-stack**: Heroku
- **Database**: Heroku Postgres
- **Storage**: AWS S3

## 📁 **Audio File Storage**

### **Current Local Storage:**
```
server/uploads/
├── conversation1_user1_local_1234567890.webm
├── conversation1_user1_remote_1234567891.webm
└── ...
```

### **Production Cloud Storage:**

#### **AWS S3 Setup:**
1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://your-audio-platform-bucket
   aws s3api put-bucket-cors --bucket your-audio-platform-bucket --cors-configuration file://cors.json
   ```

2. **CORS Configuration (cors.json):**
   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": ["https://your-domain.com"],
         "AllowedMethods": ["GET", "POST", "PUT"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3000
       }
     ]
   }
   ```

3. **Install AWS SDK:**
   ```bash
   npm install aws-sdk
   ```

#### **Updated Server Code:**
```javascript
// server/config/s3.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const uploadAudioToS3 = async (file, conversationId, userId, audioType) => {
  const key = `conversations/${conversationId}/${userId}_${audioType}_${Date.now()}.webm`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: 'audio/webm',
    ACL: 'private'
  };
  
  const result = await s3.upload(params).promise();
  return {
    s3Key: key,
    s3Url: result.Location,
    filename: file.originalname
  };
};

const getAudioFromS3 = async (s3Key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key
  };
  
  return await s3.getObject(params).promise();
};

module.exports = { uploadAudioToS3, getAudioFromS3 };
```

## 🗄️ **Database Setup**

### **MongoDB Atlas (Recommended):**

1. **Create MongoDB Atlas Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free cluster
   - Get connection string

2. **Install MongoDB Driver:**
   ```bash
   npm install mongoose
   ```

3. **Database Models:**
```javascript
// server/models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    id: String,
    name: String,
    socketId: String
  }],
  isActive: {
    type: Boolean,
    default: false
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
```

```javascript
// server/models/AudioFile.js
const mongoose = require('mongoose');

const AudioFileSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  audioType: {
    type: String,
    enum: ['local', 'remote', 'mixed'],
    required: true
  },
  filename: String,
  s3Key: String,
  s3Url: String,
  fileSize: Number,
  uploadTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AudioFile', AudioFileSchema);
```

## 🔧 **Environment Variables**

### **Production .env:**
```env
# Server Configuration
PORT=5001
NODE_ENV=production

# Agora Configuration
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/audio-platform

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-audio-platform-bucket

# Client URL (for CORS)
CLIENT_URL=https://your-domain.com
```

## 🚀 **Deployment Steps**

### **1. Frontend (Vercel):**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd client
   vercel
   ```

3. **Update API URL:**
   ```javascript
   // client/src/App.js
   const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
   ```

### **2. Backend (Railway):**

1. **Create Railway Account:**
   - Go to [Railway](https://railway.app)
   - Connect GitHub repository

2. **Deploy:**
   ```bash
   # Railway will auto-deploy from GitHub
   # Add environment variables in Railway dashboard
   ```

3. **Update package.json:**
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "build": "echo 'No build step needed'"
     }
   }
   ```

### **3. Database (MongoDB Atlas):**

1. **Create Cluster:**
   - MongoDB Atlas dashboard
   - Create free cluster
   - Get connection string

2. **Add to Environment Variables:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/audio-platform
   ```

## 📊 **File Structure After Deployment**

### **S3 Bucket Structure:**
```
your-audio-platform-bucket/
├── conversations/
│   ├── conversation1/
│   │   ├── user1_local_1234567890.webm
│   │   ├── user1_remote_1234567891.webm
│   │   ├── user2_local_1234567892.webm
│   │   └── user2_remote_1234567893.webm
│   └── conversation2/
│       ├── user1_local_1234567894.webm
│       └── user1_remote_1234567895.webm
```

### **Database Collections:**
```javascript
// conversations collection
{
  _id: ObjectId,
  conversationId: "conversation1",
  participants: [
    { id: "user1", name: "Alice", socketId: "socket1" },
    { id: "user2", name: "Bob", socketId: "socket2" }
  ],
  isActive: true,
  isRecording: false,
  startTime: ISODate("2024-01-01T10:00:00Z"),
  endTime: ISODate("2024-01-01T10:30:00Z"),
  createdAt: ISODate("2024-01-01T10:00:00Z")
}

// audioFiles collection
{
  _id: ObjectId,
  conversationId: "conversation1",
  userId: "user1",
  audioType: "local",
  filename: "user1_local_1234567890.webm",
  s3Key: "conversations/conversation1/user1_local_1234567890.webm",
  s3Url: "https://your-bucket.s3.amazonaws.com/conversations/conversation1/user1_local_1234567890.webm",
  fileSize: 1048576,
  uploadTime: ISODate("2024-01-01T10:30:00Z")
}
```

## 🔒 **Security Considerations**

### **1. Environment Variables:**
- ✅ Never commit `.env` files
- ✅ Use platform-specific secret management
- ✅ Rotate keys regularly

### **2. CORS Configuration:**
- ✅ Restrict origins to your domain
- ✅ Use HTTPS in production

### **3. File Access:**
- ✅ Use signed URLs for S3 access
- ✅ Implement user authentication
- ✅ Validate file uploads

### **4. Rate Limiting:**
```javascript
// server/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: 'Too many uploads from this IP'
});

module.exports = { uploadLimiter };
```

## 💰 **Cost Estimation**

### **Free Tier (Development):**
- **Vercel**: Free (100GB bandwidth)
- **Railway**: Free (500 hours/month)
- **MongoDB Atlas**: Free (512MB storage)
- **AWS S3**: Free (5GB storage, 20,000 requests)

### **Production (1000 users):**
- **Vercel**: $20/month
- **Railway**: $5/month
- **MongoDB Atlas**: $9/month
- **AWS S3**: ~$5-10/month (depending on usage)

**Total**: ~$40-50/month for 1000 users

## 🎯 **Next Steps**

1. **Choose hosting platform** (Vercel + Railway recommended)
2. **Set up cloud storage** (AWS S3)
3. **Configure database** (MongoDB Atlas)
4. **Update environment variables**
5. **Deploy frontend and backend**
6. **Test thoroughly**
7. **Monitor and scale as needed**

Your audio platform will be production-ready! 🚀
