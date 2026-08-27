import https from 'http';

const endpoints = [
  '/api/listing/get?limit=3&sort=createdAt&order=desc',
  '/api/service/get?limit=3&sort=createdAt&order=desc',
  '/api/helper/get?limit=3&sort=createdAt&order=desc',
  '/api/event/get?limit=3&sort=date&order=asc',
  '/api/sell?limit=3',
];

for (const ep of endpoints) {
  await new Promise(resolve => {
    https.get(`http://localhost:3000${ep}`, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const status = res.statusCode;
        let preview = '';
        try {
          const j = JSON.parse(data);
          if (j.success === false) preview = `ERROR: ${j.message}`;
          else if (Array.isArray(j)) preview = `array[${j.length}]`;
          else preview = `keys: ${Object.keys(j).join(', ')}`;
        } catch { preview = data.substring(0, 80); }
        const icon = status === 200 ? '✅' : '❌';
        console.log(`${icon} ${status} ${ep} → ${preview}`);
        resolve();
      });
    }).on('error', err => {
      console.log(`❌ NETWORK ERROR ${ep}: ${err.message}`);
      resolve();
    });
  });
}
