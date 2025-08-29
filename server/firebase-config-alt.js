const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK with multiple fallback methods
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    console.log('🔍 Firebase Config Debug:');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);

    let app;

    // Method 1: Try using service account JSON file
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      console.log('📁 Using service account JSON file');
      const serviceAccount = require(serviceAccountPath);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    // Method 2: Try using environment variables
    else if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔧 Using environment variables');
      
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Handle different private key formats
      if (privateKey) {
        // Remove quotes if present
        privateKey = privateKey.replace(/^"|"$/g, '');
        // Replace \n with actual line breaks
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      };

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    // Method 3: Fallback to demo mode
    else {
      console.log('⚠️ No Firebase credentials found, using demo mode');
      return null;
    }

    console.log('✅ Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('❌ Error details:', error);
    return null;
  }
};

// Get Firestore instance
const getFirestore = () => {
  const app = initializeFirebase();
  return app ? admin.firestore(app) : null;
};

// Get Storage instance
const getStorage = () => {
  const app = initializeFirebase();
  return app ? admin.storage(app) : null;
};

// Get bucket instance
const getBucket = () => {
  const storage = getStorage();
  return storage ? storage.bucket() : null;
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getStorage,
  getBucket,
  admin
};
