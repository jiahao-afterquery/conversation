# Quick Setup Guide

## 🚀 Get Started Immediately

The audio platform is now configured to run in **demo mode** without requiring Agora credentials. This allows you to test all the functionality immediately.

### Current Status:
✅ **Server**: Running on http://localhost:5001  
✅ **Client**: Running on http://localhost:3000  
✅ **Demo Mode**: Enabled (no Agora credentials required)

## 🌐 Access the Application

Open your browser and go to: **http://localhost:3000**

## 🎯 What You Can Test Now

### Demo Mode Features:
- ✅ Join the platform with your name
- ✅ See other users online
- ✅ Start conversations with available users
- ✅ View conversation interface
- ✅ Test recording functionality (simulated)
- ✅ Upload audio files to server
- ✅ View uploaded files

### Demo Mode Limitations:
- ⚠️ Audio communication is simulated (no real audio streaming)
- ⚠️ Recording creates local files but doesn't stream audio
- ⚠️ No real-time audio between users

## 🔧 For Full Audio Functionality

To enable real audio communication, you need Agora credentials:

1. **Sign up for Agora**: https://www.agora.io/
2. **Create a project** and get your App ID and Certificate
3. **Create environment file**:
   ```bash
   cd server
   cp env.example .env
   ```
4. **Edit .env file** with your credentials:
   ```env
   AGORA_APP_ID=your-actual-app-id
   AGORA_APP_CERTIFICATE=your-actual-certificate
   PORT=5001
   NODE_ENV=development
   ```
5. **Restart the server**:
   ```bash
   cd server
   PORT=5001 node index.js
   ```

## 🛠️ Troubleshooting

### If you see "Connecting to server...":
- Make sure the server is running on port 5001
- Check that no other process is using port 5001
- Restart the server: `cd server && PORT=5001 node index.js`

### If you see "Failed to connect to audio channel":
- This is normal in demo mode
- The application will still work for testing other features
- For real audio, configure Agora credentials as shown above

### If ports are in use:
- Kill existing processes: `pkill -f "node"`
- Use different ports by setting environment variables

## 📱 Testing with Multiple Users

1. Open multiple browser tabs/windows
2. Join with different names in each tab
3. Start conversations between the different "users"
4. Test the conversation flow and recording features

## 🎉 You're Ready!

The platform is now fully functional in demo mode. You can test all the user interface and conversation management features. When you're ready for real audio communication, just add your Agora credentials!
