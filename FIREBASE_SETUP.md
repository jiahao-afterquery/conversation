# 🔥 Firebase Setup Guide

## 📋 **Overview**

This guide will help you set up Firebase for your audio platform with:
- **Firestore**: Real-time database for conversations and users
- **Firebase Storage**: Audio file storage with CDN
- **Firebase Auth**: User authentication (optional)
- **Vercel**: Frontend hosting
- **Railway**: Backend hosting

## 🚀 **Why Firebase is Perfect for Audio Platform**

### **1. Real-time Database (Firestore):**
```javascript
// Real-time conversation updates
const conversationRef = db.collection('conversations').doc(conversationId);
conversationRef.onSnapshot((doc) => {
  // Automatically updates when conversation state changes
  const conversation = doc.data();
  // Update UI in real-time
});
```

### **2. Audio File Storage:**
```javascript
// Upload audio files to Firebase Storage
const audioRef = storage.ref(`conversations/${conversationId}/${userId}_${audioType}.webm`);
await audioRef.put(audioBlob);
const downloadURL = await audioRef.getDownloadURL();
```

### **3. Integrated Authentication:**
```javascript
// User authentication (optional)
const user = await auth.signInAnonymously();
// or
const user = await auth.signInWithEmailAndPassword(email, password);
```

## 🔧 **Firebase Project Setup**

### **1. Create Firebase Project:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: "audio-platform"
4. Enable Google Analytics (optional)
5. Create project

### **2. Enable Services:**

#### **Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Start in test mode (for development)
4. Choose location (us-central1 recommended)

#### **Storage:**
1. Go to Storage
2. Click "Get started"
3. Start in test mode
4. Choose same location as Firestore

#### **Authentication (Optional):**
1. Go to Authentication
2. Click "Get started"
3. Enable Anonymous authentication
4. Enable Email/Password (if needed)

### **3. Get Configuration:**
1. Go to Project Settings
2. Scroll to "Your apps"
3. Click "Add app" → Web
4. Copy config object

## 📁 **Updated Project Structure**

### **Firebase Configuration:**
```javascript
// client/src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
```

### **Server Firebase Admin:**
```javascript
// server/config/firebase-admin.js
const admin = require('firebase-admin');

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, db, storage };
```

## 🗄️ **Firestore Database Schema**

### **Collections Structure:**
```
firestore/
├── users/
│   ├── userId1/
│   │   ├── name: "Alice"
│   │   ├── isInConversation: false
│   │   ├── currentConversationId: null
│   │   └── lastSeen: timestamp
│   └── userId2/
│       ├── name: "Bob"
│       ├── isInConversation: false
│       ├── currentConversationId: null
│       └── lastSeen: timestamp
├── conversations/
│   ├── conversationId1/
│   │   ├── participants: ["userId1", "userId2"]
│   │   ├── isActive: true
│   │   ├── isRecording: false
│   │   ├── startTime: timestamp
│   │   ├── endTime: timestamp
│   │   └── createdAt: timestamp
│   └── conversationId2/
│       └── ...
└── audioFiles/
    ├── audioFileId1/
    │   ├── conversationId: "conversationId1"
    │   ├── userId: "userId1"
    │   ├── audioType: "local"
    │   ├── filename: "user1_local_1234567890.webm"
    │   ├── storagePath: "conversations/conversationId1/user1_local_1234567890.webm"
    │   ├── downloadURL: "https://..."
    │   ├── fileSize: 1048576
    │   └── uploadTime: timestamp
    └── audioFileId2/
        └── ...
```

## 📁 **Firebase Storage Structure**

### **Audio Files Organization:**
```
firebase-storage/
└── conversations/
    ├── conversationId1/
    │   ├── user1_local_1234567890.webm
    │   ├── user1_remote_1234567891.webm
    │   ├── user2_local_1234567892.webm
    │   └── user2_remote_1234567893.webm
    └── conversationId2/
        ├── user1_local_1234567894.webm
        └── user1_remote_1234567895.webm
```

## 🔧 **Updated Server Code**

### **Firebase Integration:**
```javascript
// server/index.js (updated)
const { db, storage } = require('./config/firebase-admin');

// Replace in-memory storage with Firestore
const users = db.collection('users');
const conversations = db.collection('conversations');
const audioFiles = db.collection('audioFiles');

// Upload audio to Firebase Storage
const uploadAudioToFirebase = async (file, conversationId, userId, audioType) => {
  const filename = `${userId}_${audioType}_${Date.now()}.webm`;
  const storagePath = `conversations/${conversationId}/${filename}`;
  
  const bucket = storage.bucket();
  const fileRef = bucket.file(storagePath);
  
  await fileRef.save(file.buffer, {
    metadata: {
      contentType: 'audio/webm'
    }
  });
  
  // Make file publicly accessible (or use signed URLs)
  await fileRef.makePublic();
  
  const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  
  // Save metadata to Firestore
  const audioFileData = {
    conversationId,
    userId,
    audioType,
    filename,
    storagePath,
    downloadURL,
    fileSize: file.size,
    uploadTime: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await audioFiles.add(audioFileData);
  
  return audioFileData;
};

// Updated upload endpoint
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const { conversationId, userId, audioType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }
    
    const audioFileData = await uploadAudioToFirebase(
      req.file,
      conversationId,
      userId,
      audioType
    );
    
    res.json({ success: true, audioFile: audioFileData });
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});
```

## 🌐 **Updated Client Code**

### **Real-time Updates:**
```javascript
// client/src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  
  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(conversationsData);
    });
    
    return () => unsubscribe();
  }, []);
  
  return conversations;
};

export const useAudioFiles = (conversationId) => {
  const [audioFiles, setAudioFiles] = useState([]);
  
  useEffect(() => {
    if (!conversationId) return;
    
    const q = query(
      collection(db, 'audioFiles'),
      where('conversationId', '==', conversationId),
      orderBy('uploadTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAudioFiles(filesData);
    });
    
    return () => unsubscribe();
  }, [conversationId]);
  
  return audioFiles;
};
```

## 🔧 **Environment Variables**

### **Client (.env):**
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### **Server (.env):**
```env
# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Agora Configuration
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# Server Configuration
PORT=5001
NODE_ENV=production
```

## 🚀 **Deployment Steps**

### **1. Install Firebase Dependencies:**
```bash
# Client
cd client
npm install firebase

# Server
cd server
npm install firebase-admin
```

### **2. Set Up Firebase Security Rules:**

#### **Firestore Rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null;
    }
    
    match /audioFiles/{audioFileId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### **Storage Rules:**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /conversations/{conversationId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **3. Deploy to Vercel + Railway:**
```bash
# Frontend (Vercel)
cd client
vercel

# Backend (Railway)
# Connect GitHub repo to Railway
# Add environment variables in Railway dashboard
```

## 💰 **Firebase Pricing**

### **Free Tier (Spark Plan):**
- **Firestore**: 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Storage**: 5GB storage, 1GB downloads/day
- **Auth**: 10,000 authentications/month

### **Production (Blaze Plan - Pay as you go):**
- **Firestore**: $0.18/GB/month + $0.06/100K reads + $0.18/100K writes
- **Storage**: $0.026/GB/month + $0.12/GB downloads
- **Auth**: $0.01/authentication after free tier

### **Cost for 1000 users:**
- **Firestore**: ~$5-10/month
- **Storage**: ~$10-20/month (depending on audio usage)
- **Auth**: ~$5/month
- **Total**: ~$20-35/month

## 🎯 **Benefits of Firebase Setup**

### **1. Real-time Features:**
- ✅ **Live updates**: No manual WebSocket management
- ✅ **Offline support**: Works without internet
- ✅ **Automatic sync**: Data stays in sync across devices

### **2. Scalability:**
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Global CDN**: Fast audio file delivery worldwide
- ✅ **No server management**: Fully managed service

### **3. Development Experience:**
- ✅ **Easy setup**: Simple configuration
- ✅ **Great docs**: Excellent documentation
- ✅ **Rich ecosystem**: Many tools and libraries

## 🎉 **Result**

With Firebase + Vercel + Railway, you get:
- **Real-time audio platform** with live updates
- **Scalable cloud storage** for audio files
- **Professional hosting** with global CDN
- **Cost-effective** solution for 1000+ users
- **Easy maintenance** with managed services

Your audio platform will be production-ready with Firebase! 🔥
