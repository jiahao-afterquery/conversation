const { getFirestore } = require('../firebase-config');

class FirebaseDB {
  constructor() {
    this.db = getFirestore();
    this.conversations = this.db?.collection('conversations');
    this.users = this.db?.collection('users');
    this.audioFiles = this.db?.collection('audioFiles');
  }

  // Check if Firebase is available
  isAvailable() {
    return this.db !== null;
  }

  // User Management
  async createUser(userId, userData) {
    if (!this.isAvailable()) return null;
    
    try {
      const userRef = this.users.doc(userId);
      await userRef.set({
        userId,
        name: userData.name || `User ${userId}`,
        isInConversation: false,
        currentConversationId: null,
        createdAt: new Date(),
        ...userData
      });
      return { userId, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUser(userId) {
    if (!this.isAvailable()) return null;
    
    try {
      const userDoc = await this.users.doc(userId).get();
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUser(userId, updates) {
    if (!this.isAvailable()) return false;
    
    try {
      await this.users.doc(userId).update({
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async getAllUsers() {
    if (!this.isAvailable()) return [];
    
    try {
      const snapshot = await this.users.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Conversation Management
  async createConversation(conversationId, participants) {
    if (!this.isAvailable()) return null;
    
    try {
      const conversationRef = this.conversations.doc(conversationId);
      const conversationData = {
        conversationId,
        participants,
        isActive: true,
        isRecording: false,
        startTime: new Date(),
        endTime: null
      };
      
      await conversationRef.set(conversationData);
      
      // Update participants' conversation status
      for (const userId of participants) {
        await this.updateUser(userId, {
          isInConversation: true,
          currentConversationId: conversationId
        });
      }
      
      return conversationData;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  async getConversation(conversationId) {
    if (!this.isAvailable()) return null;
    
    try {
      const conversationDoc = await this.conversations.doc(conversationId).get();
      return conversationDoc.exists ? conversationDoc.data() : null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  async updateConversation(conversationId, updates) {
    if (!this.isAvailable()) return false;
    
    try {
      await this.conversations.doc(conversationId).update({
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  }

  async endConversation(conversationId) {
    if (!this.isAvailable()) return false;
    
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return false;

      // Update conversation
      await this.updateConversation(conversationId, {
        isActive: false,
        isRecording: false,
        endTime: new Date()
      });

      // Update participants' conversation status
      for (const userId of conversation.participants) {
        await this.updateUser(userId, {
          isInConversation: false,
          currentConversationId: null
        });
      }

      return true;
    } catch (error) {
      console.error('Error ending conversation:', error);
      return false;
    }
  }

  // Audio File Management
  async saveAudioFile(fileData) {
    if (!this.isAvailable()) return null;
    
    try {
      const audioFileRef = this.audioFiles.doc();
      const audioFileData = {
        fileId: audioFileRef.id,
        conversationId: fileData.conversationId,
        userId: fileData.userId,
        audioType: fileData.audioType || 'local',
        filename: fileData.filename,
        originalName: fileData.originalName,
        size: fileData.size,
        uploadTime: new Date(),
        downloadUrl: fileData.downloadUrl,
        path: fileData.path
      };
      
      await audioFileRef.set(audioFileData);
      return audioFileData;
    } catch (error) {
      console.error('Error saving audio file:', error);
      return null;
    }
  }

  async getConversationAudioFiles(conversationId) {
    if (!this.isAvailable()) return [];
    
    try {
      const snapshot = await this.audioFiles
        .where('conversationId', '==', conversationId)
        .orderBy('uploadTime', 'desc')
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting conversation audio files:', error);
      return [];
    }
  }

  async getUserAudioFiles(userId) {
    if (!this.isAvailable()) return [];
    
    try {
      const snapshot = await this.audioFiles
        .where('userId', '==', userId)
        .orderBy('uploadTime', 'desc')
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting user audio files:', error);
      return [];
    }
  }
}

module.exports = new FirebaseDB();
