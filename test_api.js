import http from 'http';

function makeRequest(path, method = 'GET') {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                // we don't have a valid token, but maybe we can see the error or it will be 401
                // Wait, to test getHostBookings we don't need a token if there's no verifyToken
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[${method}] ${path} - Status: ${res.statusCode}`);
                try {
                    console.log(JSON.parse(data));
                } catch(e) {
                    console.log(data);
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(`Problem with request to ${path}: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function test() {
    await makeRequest('/api/bookings/host/68764d5a6b70a9ce2c8fe564');
    // For notifications, we need a token to pass verifyToken, so we might just get 401
    await makeRequest('/api/notifications');
}

test();
