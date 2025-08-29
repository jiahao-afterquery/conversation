# 🔥 Firebase Environment Variables Setup

## Required Environment Variables for Render.com

Add these environment variables to your Render.com backend service:

### **1. Firebase Project Configuration**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### **2. Firebase Service Account (Required for Server Access)**

You need to get these from your Firebase service account JSON file:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Download the JSON file
7. Copy these values from the JSON:

```
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour long private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
```

### **3. Example Values**

Replace `your-project-id` with your actual Firebase project ID:

```
FIREBASE_PROJECT_ID=audio-collection-platform-12345
FIREBASE_STORAGE_BUCKET=audio-collection-platform-12345.appspot.com
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@audio-collection-platform-12345.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-abc123%40audio-collection-platform-12345.iam.gserviceaccount.com
```

## 🔧 **How to Add Environment Variables in Render.com**

1. Go to your Render.com dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add each variable one by one

## ⚠️ **Important Notes**

- **Private Key**: Make sure to include the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Quotes**: The `FIREBASE_PRIVATE_KEY` should be wrapped in quotes
- **Newlines**: The private key should have `\n` for line breaks
- **No Spaces**: Don't add extra spaces around the `=` sign

## 🧪 **Testing**

After adding the environment variables:

1. Redeploy your Render.com service
2. Check the logs for: `✅ Firebase initialized successfully`
3. Test recording and uploading audio files
4. Check Firebase Storage for uploaded files
5. Check Firebase Firestore for conversation and user data

## 🔍 **Troubleshooting**

If you see `❌ Firebase initialization failed`:

1. Check that all environment variables are set correctly
2. Verify your service account has the right permissions
3. Make sure your Firebase project is active
4. Check that Storage and Firestore are enabled in Firebase Console
