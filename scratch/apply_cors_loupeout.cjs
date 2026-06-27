const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const BUCKET = 'loupeout-home.appspot.com';

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
      'User-Agent',
      'x-goog-resumable'
    ],
    maxAgeSeconds: 3600
  }
];

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

    console.log(`Sending PATCH request to: ${options.hostname}${options.path}`);

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

    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });
    
    req.write(body);
    req.end();
  });
}

async function main() {
  const home = os.homedir();
  const configPath = path.join(home, '.config', 'configstore', 'firebase-tools.json');

  if (!fs.existsSync(configPath)) {
    console.error('❌ Config file not found at:', configPath);
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = data.tokens.access_token;
    if (!token) {
      console.error('❌ No access token found in config.');
      return;
    }

    console.log('Found access token in firebase-tools config. Applying CORS...');
    await patchBucketCors(token);
  } catch (err) {
    console.error('❌ Error during script execution:', err.message);
  }
}

main();
