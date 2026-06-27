/**
 * Applies CORS configuration to Firebase Storage bucket
 * using the Google Cloud Storage JSON API
 */
const { execSync } = require('child_process');
const https = require('https');

const BUCKET = 'central-cinema-218106.firebasestorage.app';

const CORS_CONFIG = [
  {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://central-cinema-218106.web.app',
      'https://central-cinema-218106.firebaseapp.com'
    ],
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'x-goog-resumable'
    ],
    maxAgeSeconds: 3600
  }
];

async function getAccessToken() {
  try {
    // Try to get token from firebase CLI
    const token = execSync(
      'node "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npx-cli.js" firebase-tools@latest login:ci --no-localhost 2>&1',
      { encoding: 'utf8', timeout: 5000 }
    );
    return token.trim();
  } catch {
    return null;
  }
}

function patchBucketCors(accessToken) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ cors: CORS_CONFIG });

    const options = {
      hostname: 'storage.googleapis.com',
      path: `/storage/v1/b/${encodeURIComponent(BUCKET)}?fields=cors`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ CORS applied successfully!');
          console.log(JSON.parse(data));
          resolve(data);
        } else {
          console.error('❌ Failed:', res.statusCode, data);
          reject(new Error(data));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Getting Firebase access token...');
  
  // Try using application default credentials
  try {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/devstorage.full_control']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    console.log('✅ Got access token via Application Default Credentials');
    await patchBucketCors(token);
  } catch (err) {
    console.error('❌ Could not get credentials automatically:', err.message);
    console.log('\n📋 Manual fix: Run these commands in Google Cloud Shell (https://shell.cloud.google.com):');
    console.log('\ncat > cors.json << \'EOF\'');
    console.log(JSON.stringify(CORS_CONFIG, null, 2));
    console.log('EOF');
    console.log(`\ngsutil cors set cors.json gs://${BUCKET}`);
  }
}

main();
