const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
require('dotenv').config();

// Firebase services
const firebaseDB = require('./services/firebase-db');
const firebaseStorage = require('./services/firebase-storage');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../client/build')));

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const conversationId = req.body.conversationId;
    const userId = req.body.userId;
    const audioType = req.body.audioType || 'local';
    const timestamp = Date.now();
    cb(null, `${conversationId}_${userId}_${audioType}_${timestamp}.webm`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// In-memory storage (in production, use Redis or database)
const users = new Map();
const conversations = new Map();
const userConversations = new Map();

// Agora configuration
const APP_ID = process.env.AGORA_APP_ID || 'demo-app-id';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'demo-certificate';

// Generate Agora token
function generateToken(channelName, uid) {
  // If using demo credentials, return a demo token
  if (APP_ID === 'demo-app-id' || APP_CERTIFICATE === 'demo-certificate') {
    return 'demo-token';
  }

  // Sanitize channel name and uid for Agora requirements
  const sanitizeForAgora = (str) => {
    if (!str) return 'default';
    // Remove invalid characters and limit length to 64 bytes
    return str.replace(/[^a-zA-Z0-9\s!#$%&()+\-:;<=.>?@[\]^_{|}~,]/g, '').substring(0, 64);
  };
  
  const sanitizedChannelName = sanitizeForAgora(channelName);
  const sanitizedUid = sanitizeForAgora(uid);
  
  console.log('Token generation - sanitized params:', {
    originalChannelName: channelName,
    sanitizedChannelName: sanitizedChannelName,
    originalUid: uid,
    sanitizedUid: sanitizedUid
  });

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    sanitizedChannelName,
    sanitizedUid,
    role,
    privilegeExpiredTs
  );
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins the platform
  socket.on('join-platform', async (userData) => {
    const userId = socket.id;
    
    // Create user in Firebase (if available)
    const firebaseUser = await firebaseDB.createUser(userId, {
      name: userData.name,
      socketId: socket.id
    });

    const user = {
      id: userId,
      name: userData.name,
      socketId: socket.id,
      isInConversation: false,
      currentConversationId: null
    };

    users.set(userId, user);
    userConversations.set(userId, null);

    // Get user list from Firebase or fallback to in-memory
    let userList;
    if (firebaseDB.isAvailable()) {
      const firebaseUsers = await firebaseDB.getAllUsers();
      userList = firebaseUsers.map(u => ({
        id: u.userId,
        name: u.name,
        isInConversation: u.isInConversation
      }));
    } else {
      userList = Array.from(users.values()).map(u => ({
        id: u.id,
        name: u.name,
        isInConversation: u.isInConversation
      }));
    }

    io.emit('user-list-updated', userList);
    socket.emit('joined-platform', { userId, userList });
  });

  // User selects another user to start a conversation
  socket.on('start-conversation', async (targetUserId) => {
    const currentUser = users.get(socket.id);
    const targetUser = users.get(targetUserId);

    if (!currentUser || !targetUser) {
      socket.emit('error', 'User not found');
      return;
    }

    if (currentUser.isInConversation || targetUser.isInConversation) {
      socket.emit('error', 'One or both users are already in a conversation');
      return;
    }

    // Generate a shorter, Agora-compatible conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create conversation in Firebase (if available)
    const firebaseConversation = await firebaseDB.createConversation(conversationId, [currentUser.id, targetUserId]);
    
    const conversation = {
      id: conversationId,
      participants: [currentUser.id, targetUserId],
      isActive: false,
      isRecording: false,
      startTime: null,
      endTime: null
    };

    conversations.set(conversationId, conversation);
    
    // Update user states
    currentUser.isInConversation = true;
    currentUser.currentConversationId = conversationId;
    targetUser.isInConversation = true;
    targetUser.currentConversationId = conversationId;
    
    userConversations.set(currentUser.id, conversationId);
    userConversations.set(targetUserId, conversationId);

    // Generate Agora tokens for both users
    const currentUserToken = generateToken(conversationId, currentUser.id);
    const targetUserToken = generateToken(conversationId, targetUserId);

    // Notify both users
    io.to(currentUser.socketId).emit('conversation-started', {
      conversationId,
      participants: [currentUser, targetUser],
      token: currentUserToken,
      channelName: conversationId,
      appId: APP_ID
    });

    io.to(targetUser.socketId).emit('conversation-started', {
      conversationId,
      participants: [currentUser, targetUser],
      token: targetUserToken,
      channelName: conversationId,
      appId: APP_ID
    });

    // Update user list for all users
    const userList = Array.from(users.values()).map(u => ({
      id: u.id,
      name: u.name,
      isInConversation: u.isInConversation
    }));
    io.emit('user-list-updated', userList);
  });

  // Start recording conversation
  socket.on('start-recording', (conversationId) => {
    console.log('=== START RECORDING REQUEST ===');
    console.log('Conversation ID:', conversationId);
    console.log('Socket ID:', socket.id);
    
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      console.log('Conversation not found');
      socket.emit('error', 'Conversation not found');
      return;
    }

    if (!conversation.participants.includes(socket.id)) {
      console.log('Not a participant in this conversation');
      socket.emit('error', 'Not a participant in this conversation');
      return;
    }

    console.log('Conversation participants:', conversation.participants);
    console.log('Setting conversation.isRecording = true');

    conversation.isRecording = true;
    conversation.startTime = new Date();

    // Notify both participants
    conversation.participants.forEach(participantId => {
      const participant = users.get(participantId);
      if (participant) {
        console.log(`Sending recording-started to participant: ${participantId} (${participant.name})`);
        io.to(participant.socketId).emit('recording-started', { conversationId });
      } else {
        console.log(`Participant not found: ${participantId}`);
      }
    });
  });

  // Stop recording conversation
  socket.on('stop-recording', (conversationId) => {
    console.log('=== STOP RECORDING REQUEST ===');
    console.log('Conversation ID:', conversationId);
    console.log('Socket ID:', socket.id);
    
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      console.log('Conversation not found');
      socket.emit('error', 'Conversation not found');
      return;
    }

    if (!conversation.participants.includes(socket.id)) {
      console.log('Not a participant in this conversation');
      socket.emit('error', 'Not a participant in this conversation');
      return;
    }

    console.log('Conversation participants:', conversation.participants);
    console.log('Setting conversation.isRecording = false');

    conversation.isRecording = false;
    conversation.endTime = new Date();

    // Notify both participants
    conversation.participants.forEach(participantId => {
      const participant = users.get(participantId);
      if (participant) {
        console.log(`Sending recording-stopped to participant: ${participantId} (${participant.name})`);
        io.to(participant.socketId).emit('recording-stopped', { conversationId });
      } else {
        console.log(`Participant not found: ${participantId}`);
      }
    });
  });

  // End conversation
  socket.on('end-conversation', (conversationId) => {
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      socket.emit('error', 'Conversation not found');
      return;
    }

    if (!conversation.participants.includes(socket.id)) {
      socket.emit('error', 'Not a participant in this conversation');
      return;
    }

    // Update user states
    conversation.participants.forEach(participantId => {
      const participant = users.get(participantId);
      if (participant) {
        participant.isInConversation = false;
        participant.currentConversationId = null;
        userConversations.set(participantId, null);
        
        io.to(participant.socketId).emit('conversation-ended', { conversationId });
      }
    });

    conversations.delete(conversationId);

    // Update user list for all users
    const userList = Array.from(users.values()).map(u => ({
      id: u.id,
      name: u.name,
      isInConversation: u.isInConversation
    }));
    io.emit('user-list-updated', userList);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user && user.isInConversation) {
      const conversationId = user.currentConversationId;
      const conversation = conversations.get(conversationId);
      
      if (conversation) {
        // End the conversation for the other participant
        const otherParticipantId = conversation.participants.find(id => id !== socket.id);
        const otherParticipant = users.get(otherParticipantId);
        
        if (otherParticipant) {
          otherParticipant.isInConversation = false;
          otherParticipant.currentConversationId = null;
          userConversations.set(otherParticipantId, null);
          
          io.to(otherParticipant.socketId).emit('conversation-ended', { conversationId });
        }
        
        conversations.delete(conversationId);
      }
    }

    users.delete(socket.id);
    userConversations.delete(socket.id);

    // Update user list for all users
    const userList = Array.from(users.values()).map(u => ({
      id: u.id,
      name: u.name,
      isInConversation: u.isInConversation
    }));
    io.emit('user-list-updated', userList);
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload audio file endpoint
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { conversationId, userId, audioType } = req.body;
    
    if (!conversationId || !userId) {
      return res.status(400).json({ error: 'Missing conversationId or userId' });
    }

    // Ensure uploads directory exists (for local fallback)
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory:', uploadDir);
    }

    let fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      conversationId,
      userId,
      audioType: audioType || 'local',
      uploadTime: new Date().toISOString(),
      path: req.file.path
    };

    // Upload to Firebase Storage if available
    if (firebaseStorage.isAvailable()) {
      console.log('📤 Uploading to Firebase Storage...');
      const firebaseFileInfo = await firebaseStorage.uploadAudioFile(
        req.file.path,
        conversationId,
        userId,
        audioType
      );
      
      if (firebaseFileInfo) {
        fileInfo = { ...fileInfo, ...firebaseFileInfo };
        
        // Save file metadata to Firebase Firestore
        await firebaseDB.saveAudioFile(fileInfo);
        
        // Clean up local file after successful upload
        try {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Local file cleaned up:', req.file.path);
        } catch (cleanupError) {
          console.warn('⚠️ Could not clean up local file:', cleanupError.message);
        }
      }
    }

    console.log('Audio file uploaded:', fileInfo);
    
    res.json({
      success: true,
      message: 'Audio file uploaded successfully',
      fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload audio file',
      details: error.message 
    });
  }
});

// Get uploaded files for a conversation
app.get('/api/conversation/:conversationId/files', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Try to get files from Firebase first
    if (firebaseDB.isAvailable()) {
      const firebaseFiles = await firebaseDB.getConversationAudioFiles(conversationId);
      if (firebaseFiles.length > 0) {
        const files = firebaseFiles.map(file => ({
          filename: file.filename,
          size: file.size,
          uploadTime: file.uploadTime,
          audioType: file.audioType,
          downloadUrl: file.downloadUrl
        }));
        return res.json({ files });
      }
    }
    
    // Fallback to local files
    const uploadDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir)
      .filter(file => file.startsWith(conversationId))
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        // Parse filename to extract audio type
        const parts = file.split('_');
        const audioType = parts.length >= 3 ? parts[2] : 'unknown';
        
        return {
          filename: file,
          size: stats.size,
          uploadTime: stats.mtime,
          audioType: audioType,
          downloadUrl: `/api/download/${file}`
        };
      });

    res.json({ files });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ error: 'Failed to get conversation files' });
  }
});

// Download a specific file
app.get('/api/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Regenerate signed URL for Firebase Storage file
app.post('/api/regenerate-signed-url', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    if (!firebaseStorage.isAvailable()) {
      return res.status(500).json({ error: 'Firebase Storage not available' });
    }
    
    const signedUrl = await firebaseStorage.generateSignedUrl(filePath, 7 * 24 * 60); // 7 days
    
    if (!signedUrl) {
      return res.status(404).json({ error: 'File not found in Firebase Storage' });
    }
    
    res.json({ signedUrl });
  } catch (error) {
    console.error('Error regenerating signed URL:', error);
    res.status(500).json({ error: 'Failed to regenerate signed URL' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.json({ message: 'Audio Collection Platform API Server' });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Agora App ID: ${APP_ID}`);
});
