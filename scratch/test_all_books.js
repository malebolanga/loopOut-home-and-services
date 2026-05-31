import http from 'http';

const ids = [
  '6a1b650a9c6465c5984c1662',
  '6a1b66ad9c6465c5984c187c',
  '6a1b68079c6465c5984c1896',
  '6a1b6b819c6465c5984c1ace'
];

function fetchBook(id) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:3000/api/sell/${id}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ id, statusCode: res.statusCode, data: json });
        } catch {
          resolve({ id, statusCode: res.statusCode, raw: data.substring(0, 100) });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log('Fetching all books from API...');
  for (const id of ids) {
    try {
      const result = await fetchBook(id);
      console.log(`- Book ${id}: Status ${result.statusCode}, Success: ${result.data?.success}, Title: "${result.data?.data?.title?.trim()}"`);
    } catch (err) {
      console.error(`- Book ${id}: Error:`, err.message);
    }
  }
}

run();
