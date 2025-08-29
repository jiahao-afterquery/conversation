# 🔍 Firebase Authentication Debug Guide

## Error: "UNAUTHENTICATED: Request had invalid authentication credentials"

This error means Firebase can't authenticate with your service account. Let's fix this:

## 🔧 **Step 1: Verify Environment Variables**

### **Check in Render.com:**
1. Go to your Render.com dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Verify these variables exist and are correct:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour long private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
```

## 🔍 **Step 2: Common Issues & Fixes**

### **Issue 1: Private Key Format**
**Problem:** Private key not properly formatted
**Solution:** Make sure the private key includes:
- `-----BEGIN PRIVATE KEY-----` at the start
- `-----END PRIVATE KEY-----` at the end
- `\n` for line breaks
- Wrapped in quotes

**Correct format:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### **Issue 2: Missing Environment Variables**
**Problem:** Some variables are missing
**Solution:** Add all 7 required variables

### **Issue 3: Wrong Project ID**
**Problem:** Project ID doesn't match your Firebase project
**Solution:** Double-check your Firebase project ID in Firebase Console

### **Issue 4: Service Account Permissions**
**Problem:** Service account doesn't have proper permissions
**Solution:** 
1. Go to Firebase Console → Project Settings → Service accounts
2. Make sure you're using the "Firebase Admin SDK" service account
3. Verify it has "Editor" role

## 🧪 **Step 3: Test Authentication**

### **Add Debug Logging:**
Add this to your server to see what's happening:

```javascript
// In server/firebase-config.js, add this logging:
console.log('Firebase Config Debug:');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key ID:', process.env.FIREBASE_PRIVATE_KEY_ID);
console.log('Private Key Length:', process.env.FIREBASE_PRIVATE_KEY?.length);
console.log('Client ID:', process.env.FIREBASE_CLIENT_ID);
```

### **Check Render.com Logs:**
1. Go to your Render.com service
2. Click **"Logs"** tab
3. Look for Firebase initialization messages
4. Check for any error messages

## 🔄 **Step 4: Redeploy After Fixes**

After fixing environment variables:
1. Render.com will auto-redeploy
2. Wait 2-3 minutes
3. Check logs for: `✅ Firebase initialized successfully`
4. Test recording again

## 📞 **Step 5: Still Having Issues?**

If you're still getting authentication errors:

1. **Regenerate Service Account Key:**
   - Go to Firebase Console → Project Settings → Service accounts
   - Delete the old key
   - Generate a new private key
   - Update environment variables with new values

2. **Check Firebase Project Status:**
   - Make sure your Firebase project is active
   - Verify Firestore and Storage are enabled

3. **Verify Service Account Email:**
   - The client email should end with `@your-project-id.iam.gserviceaccount.com`
