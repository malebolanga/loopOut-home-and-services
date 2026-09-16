import http from 'http';

async function fetchUrl(urlStr) {
    return new Promise((resolve) => {
        const url = new URL(urlStr);
        const req = http.request(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`URL: ${urlStr} -> Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        console.log(`Array length: ${parsed.length}`);
                    } else if (typeof parsed === 'object') {
                        console.log(`Keys:`, Object.keys(parsed));
                        if (parsed.listings) console.log(`Listings count:`, parsed.listings.length);
                        if (parsed.services) console.log(`Services count:`, parsed.services.length);
                    }
                } catch(e) {
                    console.log(`Raw response (first 200 chars):`, data.substring(0, 200));
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(`Error fetching ${urlStr}:`, e.message);
            resolve();
        });
        req.end();
    });
}

async function testAll() {
    console.log('Testing 10.0.0.134:3000 endpoints...');
    await fetchUrl('http://10.0.0.134:3000/api/listing/get');
    await fetchUrl('http://10.0.0.134:3000/api/service/get');
    await fetchUrl('http://10.0.0.134:3000/api/helper/get');
    await fetchUrl('http://10.0.0.134:3000/api/event/get');
    await fetchUrl('http://10.0.0.134:3000/api/looking-for/get');
}

testAll();
