import { containsInsult, validateListingText, validateImages } from '../api/utils/moderationHelper.js';

async function runTests() {
  console.log('--- STARTING MODERATION TESTS ---');

  // Test cases for containsInsult
  const textTests = [
    { input: 'This is a beautiful apartment close to the mall', expected: null },
    { input: 'Get out you bastard', expected: 'bastard' },
    { input: 'No f*ck parties allowed', expected: 'f[u*x@1k]' },
    { input: 'Stupid rules apply', expected: 'stupid' },
  ];

  console.log('\nTesting containsInsult:');
  for (const t of textTests) {
    const result = containsInsult(t.input);
    const passed = (result !== null) === (t.expected !== null);
    console.log(`- Input: "${t.input}" -> Detected: ${result} | Expected: ${t.expected} | Passed: ${passed}`);
  }

  // Test cases for validateListingText
  const listingTests = [
    {
      data: { name: 'Lovely Guesthouse', description: 'Cozy place to stay', rules: 'No smoking' },
      expectedValid: true
    },
    {
      data: { name: 'Lovely Guesthouse', description: 'This is stupidly beautiful', rules: 'No asshole behavior' },
      expectedValid: false
    }
  ];

  console.log('\nTesting validateListingText:');
  for (const t of listingTests) {
    const result = validateListingText(t.data);
    const passed = result.valid === t.expectedValid;
    console.log(`- Data: ${JSON.stringify(t.data)} -> Valid: ${result.valid} (${result.message || 'No error'}) | Expected Valid: ${t.expectedValid} | Passed: ${passed}`);
  }

  // Test cases for validateImages
  const imageTests = [
    {
      urls: ['http://example.com/uploads/photo1.jpg', 'http://example.com/uploads/kitchen.png'],
      expectedValid: true
    },
    {
      urls: ['http://example.com/uploads/sexy_pic.jpg'],
      expectedValid: false
    },
    {
      urls: ['http://example.com/uploads/my_porn_image.png'],
      expectedValid: false
    }
  ];

  console.log('\nTesting validateImages:');
  for (const t of imageTests) {
    const result = await validateImages(t.urls);
    const passed = result.valid === t.expectedValid;
    console.log(`- URLs: ${t.urls.join(', ')} -> Valid: ${result.valid} (${result.message || 'No error'}) | Expected Valid: ${t.expectedValid} | Passed: ${passed}`);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests().catch(console.error);
