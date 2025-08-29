# 🍃 MongoDB Atlas Database Setup

## Why MongoDB Atlas?

- ✅ **Free tier**: 512MB storage, shared clusters
- ✅ **Great for audio metadata** and user data
- ✅ **Easy to use** with Node.js
- ✅ **Professional** database solution
- ✅ **JSON-like documents** - perfect for audio files

## 🚀 Setup Steps

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free"
3. Create an account or sign in

### 2. Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS, Google Cloud, or Azure)
4. Choose region (closest to your users)
5. Click "Create"

### 3. Set Up Database Access
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `audio-platform-user`
4. Password: Generate a secure password
5. Role: "Read and write to any database"
6. Click "Add User"

### 4. Set Up Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Database"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### 6. Install MongoDB Driver
```bash
cd server
npm install mongodb
```

### 7. Update Environment Variables
Add to Render.com environment variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/audio-platform
```

### 8. Database Schema
```javascript
// Collections structure
conversations/
  {
    _id: ObjectId,
    conversationId: 'conv_123',
    participants: ['user1', 'user2'],
    isActive: true,
    isRecording: false,
    startTime: Date,
    endTime: Date
  }

users/
  {
    _id: ObjectId,
    userId: 'user123',
    name: 'User Name',
    isInConversation: false,
    currentConversationId: 'conv_123'
  }

audioFiles/
  {
    _id: ObjectId,
    conversationId: 'conv_123',
    userId: 'user123',
    audioType: 'local' | 'remote',
    filename: 'audio_file.webm',
    size: 12345,
    uploadTime: Date,
    downloadUrl: 'https://...'
  }
```

## 💰 Cost

- **Free tier**: 512MB storage, shared clusters
- **Paid**: $9/month for dedicated clusters

## 🎯 Benefits

1. **Flexible schema** - easy to modify data structure
2. **JSON-like documents** - natural for JavaScript
3. **Scalable** - handles large amounts of data
4. **Professional** - used by many companies
5. **Great documentation** - extensive guides available
