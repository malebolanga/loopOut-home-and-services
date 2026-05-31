import http from 'http';

const url = 'http://localhost:3000/api/sell/6a1b650a9c6465c5984c1662';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    try {
      console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log('Body:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request Error:', err.message);
});
