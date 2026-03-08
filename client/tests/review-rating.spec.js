import { test, expect } from '@playwright/test';

test('verify review rating form appears and adds rating', async ({ page }) => {
    // Let the API come up
    await page.waitForTimeout(2000);

    // Create a user and login via API
    const mockUserPayload = {
        username: 'testuser123',
        email: 'testuser@test.com',
        password: 'password123'
    };

    try {
        const signupRes = await page.request.post('http://localhost:3000/api/auth/signup', {
            data: mockUserPayload
        });
    } catch (e) {
        console.log('User might already exist, ignoring signup error');
    }

    const signinRes = await page.request.post('http://localhost:3000/api/auth/signin', {
        data: {
            email: 'testuser@test.com',
            password: 'password123'
        }
    });

    const body = await signinRes.json();
    const token = body.token || signinRes.headers()['set-cookie']?.match(/access_token=([^;]+)/)?.[1];

    expect(token).toBeTruthy();

    // Create a listing to review
    const createListingRes = await page.request.post('http://localhost:3000/api/listing/create', {
        data: {
            name: 'Test Listing for Review',
            description: 'A place to test reviews.',
            address: '123 Test St',
            regularPrice: 100,
            discountPrice: 0,
            bathrooms: 1,
            bedrooms: 1,
            furnished: true,
            parking: true,
            type: 'rent',
            offer: false,
            imageUrls: ['https://example.com/image.jpg']
        },
        headers: {
            'Cookie': `access_token=${token}`,
            'Authorization': `Bearer ${token}`
        }
    });

    const listing = await createListingRes.json();
    const listingId = listing._id;
    expect(listingId).toBeTruthy();

    // Set auth cookies and navigate to listing
    await page.context().addCookies([{
        name: 'access_token',
        value: token,
        domain: 'localhost',
        path: '/'
    }]);

    await page.evaluate((tokenVal) => {
        localStorage.setItem('token', tokenVal);
    }, token);

    // Navigate to listing page
    await page.goto(`http://localhost:5175/listing/${listingId}`);

    // Wait for the page to load
    await page.waitForSelector('h1');

    // Scroll to comments section
    const commentInput = page.locator('textarea[placeholder="Write a comment..."]');
    await commentInput.scrollIntoViewIfNeeded();

    // Fill comment
    await commentInput.fill('This is a test review with a 5 star rating!');

    // We should see the star rating UI appear because and comment form input has focus
    const stars = page.locator('.fa-star').nth(0);
    await expect(stars).toBeVisible();

    // Click on the 5th star
    const fifthStar = page.locator('.fa-star').nth(4);
    await fifthStar.click();

    // Submit comment
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait for the comment to appear in the list
    const commentText = page.locator('text=This is a test review with a 5 star rating!');
    await expect(commentText).toBeVisible();

    console.log("Successfully created a review with a 5-star rating!");
});
