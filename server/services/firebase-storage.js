const { getBucket } = require('../firebase-config');
const path = require('path');

class FirebaseStorage {
  constructor() {
    this.bucket = getBucket();
  }

  // Check if Firebase Storage is available
  isAvailable() {
    console.log('🔍 Firebase Storage check:');
    console.log('  - this.bucket:', this.bucket ? 'Available' : 'null');
    console.log('  - bucket name:', this.bucket ? this.bucket.name : 'N/A');
    return this.bucket !== null;
  }

  // Upload audio file to Firebase Storage
  async uploadAudioFile(filePath, conversationId, userId, audioType) {
    console.log('🚀 Starting Firebase upload...');
    console.log('  - filePath:', filePath);
    console.log('  - conversationId:', conversationId);
    console.log('  - userId:', userId);
    console.log('  - audioType:', audioType);
    
    if (!this.isAvailable()) {
      console.log('⚠️ Firebase Storage not available, using local storage');
      return null;
    }

    try {
      const fileName = path.basename(filePath);
      const destination = `audio-files/${conversationId}/${userId}/${audioType}/${fileName}`;
      
      console.log(`📤 Uploading ${fileName} to Firebase Storage...`);
      
      // Upload file to Firebase Storage
      console.log('📤 Attempting Firebase upload with destination:', destination);
      
      const [file] = await this.bucket.upload(filePath, {
        destination,
        metadata: {
          contentType: 'audio/wav',
          metadata: {
            conversationId,
            userId,
            audioType,
            originalName: fileName,
            uploadTime: new Date().toISOString()
          }
        },
        // Add public read access for testing
        public: true
      });

      // For uniform bucket-level access, we don't make individual files public
      // Instead, we'll use signed URLs or configure bucket-level public access
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${destination}`;
      
      console.log(`✅ File uploaded successfully: ${publicUrl}`);
      
      // Generate a signed URL for secure access (7 days expiration)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return {
        filename: fileName,
        originalName: fileName,
        size: file.metadata.size,
        downloadUrl: signedUrl,
        path: destination,
        bucket: this.bucket.name,
        signedUrl: signedUrl
      };
    } catch (error) {
      console.error('❌ Error uploading to Firebase Storage:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      
      // Check for specific Firebase errors
      if (error.code === 'storage/unauthorized') {
        console.error('🔐 Firebase Storage unauthorized - check security rules');
      } else if (error.code === 'storage/quota-exceeded') {
        console.error('💾 Firebase Storage quota exceeded');
      } else if (error.code === 'storage/unauthenticated') {
        console.error('🔑 Firebase Storage unauthenticated - check service account');
      }
      
      return null;
    }
  }

  // Delete audio file from Firebase Storage
  async deleteAudioFile(filePath) {
    if (!this.isAvailable()) return false;

    try {
      await this.bucket.file(filePath).delete();
      console.log(`🗑️ File deleted from Firebase Storage: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting from Firebase Storage:', error);
      return false;
    }
  }

  // Get file metadata from Firebase Storage
  async getFileMetadata(filePath) {
    if (!this.isAvailable()) return null;

    try {
      const [metadata] = await this.bucket.file(filePath).getMetadata();
      return metadata;
    } catch (error) {
      console.error('❌ Error getting file metadata:', error);
      return null;
    }
  }

  // List files in a conversation directory
  async listConversationFiles(conversationId) {
    if (!this.isAvailable()) return [];

    try {
      const [files] = await this.bucket.getFiles({
        prefix: `audio-files/${conversationId}/`
      });

      // Generate signed URLs for each file (7 days expiration)
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
          });
          
          return {
            name: file.name,
            size: file.metadata.size,
            timeCreated: file.metadata.timeCreated,
            downloadUrl: signedUrl
          };
        })
      );
      
      return filesWithUrls;
    } catch (error) {
      console.error('❌ Error listing conversation files:', error);
      return [];
    }
  }

  // Generate signed URL for private access (if needed)
  async generateSignedUrl(filePath, expirationMinutes = 60) {
    if (!this.isAvailable()) return null;

    try {
      const [url] = await this.bucket.file(filePath).getSignedUrl({
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000
      });
      return url;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error);
      return null;
    }
  }
}

module.exports = new FirebaseStorage();
