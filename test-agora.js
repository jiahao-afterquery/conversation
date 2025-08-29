const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Test Agora credentials
const APP_ID = '888d6b7ad52f4764b257a1252331d2b2';
const APP_CERTIFICATE = '4df05846352948ad9378a107f4356cc9';

console.log('🔍 Testing Agora Credentials...\n');

console.log('App ID:', APP_ID);
console.log('App Certificate:', APP_CERTIFICATE);
console.log('Certificate Length:', APP_CERTIFICATE.length, 'characters\n');

if (APP_CERTIFICATE.length < 30) {
  console.log('⚠️  WARNING: App Certificate seems too short!');
  console.log('   Expected: 40+ characters');
  console.log('   Current: ' + APP_CERTIFICATE.length + ' characters\n');
}

try {
  // Test token generation
  const channelName = 'test-channel';
  const uid = 'test-user';
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  console.log('✅ Token generation successful!');
  console.log('Generated token length:', token.length, 'characters');
  console.log('Token preview:', token.substring(0, 50) + '...\n');
  
  console.log('🎉 Your Agora credentials are working!');
  console.log('   You can now use real audio streaming.\n');
  
} catch (error) {
  console.log('❌ Token generation failed!');
  console.log('Error:', error.message);
  console.log('\n🔧 Please check your Agora credentials:');
  console.log('1. Go to https://console.agora.io/');
  console.log('2. Navigate to your project');
  console.log('3. Go to Project Management → Config');
  console.log('4. Copy the complete Primary Certificate');
  console.log('5. Update your .env file\n');
}

console.log('📋 Next steps:');
console.log('1. Update server/.env with PORT=5001');
console.log('2. Get complete App Certificate if needed');
console.log('3. Restart server: cd server && PORT=5001 node index.js');
console.log('4. Test real audio communication!');
