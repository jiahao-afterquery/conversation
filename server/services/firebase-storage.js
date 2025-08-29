const { getBucket } = require('../firebase-config');
const path = require('path');

class FirebaseStorage {
  constructor() {
    this.bucket = getBucket();
  }

  // Check if Firebase Storage is available
  isAvailable() {
    return this.bucket !== null;
  }

  // Upload audio file to Firebase Storage
  async uploadAudioFile(filePath, conversationId, userId, audioType) {
    if (!this.isAvailable()) {
      console.log('⚠️ Firebase Storage not available, using local storage');
      return null;
    }

    try {
      const fileName = path.basename(filePath);
      const destination = `audio-files/${conversationId}/${userId}/${audioType}/${fileName}`;
      
      console.log(`📤 Uploading ${fileName} to Firebase Storage...`);
      
      // Upload file to Firebase Storage
      const [file] = await this.bucket.upload(filePath, {
        destination,
        metadata: {
          contentType: 'audio/webm',
          metadata: {
            conversationId,
            userId,
            audioType,
            originalName: fileName,
            uploadTime: new Date().toISOString()
          }
        }
      });

      // Make file publicly accessible
      await file.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${destination}`;
      
      console.log(`✅ File uploaded successfully: ${publicUrl}`);
      
      return {
        filename: fileName,
        originalName: fileName,
        size: file.metadata.size,
        downloadUrl: publicUrl,
        path: destination,
        bucket: this.bucket.name
      };
    } catch (error) {
      console.error('❌ Error uploading to Firebase Storage:', error);
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

      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        timeCreated: file.metadata.timeCreated,
        downloadUrl: `https://storage.googleapis.com/${this.bucket.name}/${file.name}`
      }));
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
