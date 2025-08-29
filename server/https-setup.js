const https = require('https');
const fs = require('fs');
const path = require('path');

// Self-signed certificate for development
const options = {
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
};

// This is just a helper script - you'll need to generate certificates
console.log('HTTPS Setup Helper');
console.log('');
console.log('To enable HTTPS for mobile testing:');
console.log('');
console.log('1. Install mkcert:');
console.log('   brew install mkcert');
console.log('   mkcert -install');
console.log('');
console.log('2. Generate certificates:');
console.log('   cd server');
console.log('   mkcert localhost 127.0.0.1 ::1');
console.log('');
console.log('3. Update package.json to use HTTPS');
console.log('');
console.log('For now, test on desktop with two browser tabs!');
