import http from 'http';

const url = 'http://localhost:3000/api/sell';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log('Body (first 200 chars):', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Request Error:', err.message);
});
