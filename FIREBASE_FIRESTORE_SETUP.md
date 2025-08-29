# 🔥 Firebase Firestore Database Setup

## Why Firebase Firestore?

- ✅ **Free tier**: 1GB storage, 50K reads/day, 20K writes/day
- ✅ **Real-time updates** - perfect for conversation state
- ✅ **Easy integration** with Firebase Storage
- ✅ **No server setup** - fully managed
- ✅ **Automatic scaling**

## 🚀 Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it: `audio-collection-platform`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database
1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 3. Install Firebase SDK
```bash
cd server
npm install firebase-admin
```

### 4. Get Service Account Key
1. In Firebase Console, go to Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Save it as `server/firebase-service-account.json`

### 5. Update Environment Variables
Add to Render.com environment variables:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### 6. Database Schema
```javascript
// Collections structure
conversations/
  {conversationId}/
    participants: ['user1', 'user2']
    isActive: true
    isRecording: false
    startTime: timestamp
    endTime: timestamp

users/
  {userId}/
    name: 'User Name'
    isInConversation: false
    currentConversationId: 'conv_123'

audioFiles/
  {fileId}/
    conversationId: 'conv_123'
    userId: 'user123'
    audioType: 'local' | 'remote'
    filename: 'audio_file.webm'
    size: 12345
    uploadTime: timestamp
    downloadUrl: 'https://...'
```

## 💰 Cost

- **Free tier**: 1GB storage, 50K reads/day, 20K writes/day
- **Paid**: $0.18/GB/month for storage, $0.06/100K reads, $0.18/100K writes

## 🎯 Benefits

1. **Real-time updates** - conversation state syncs instantly
2. **Scalable** - handles thousands of users
3. **Integrated** - works with Firebase Storage
4. **No maintenance** - fully managed
5. **Professional** - production-ready
