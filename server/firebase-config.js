const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Debug logging
    console.log('🔍 Firebase Config Debug:');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);
    console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('Private Key ID:', process.env.FIREBASE_PRIVATE_KEY_ID);
    console.log('Private Key Length:', process.env.FIREBASE_PRIVATE_KEY?.length);
    console.log('Client ID:', process.env.FIREBASE_CLIENT_ID);
    console.log('Client Cert URL:', process.env.FIREBASE_CLIENT_CERT_URL);

    // Check if all required variables are present
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET', 
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_CLIENT_CERT_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing Firebase environment variables:', missingVars);
      return null;
    }

    // Initialize with environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    console.log('🔧 Service Account Config:', {
      type: serviceAccount.type,
      project_id: serviceAccount.project_id,
      client_email: serviceAccount.client_email,
      private_key_length: serviceAccount.private_key?.length
    });

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

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
