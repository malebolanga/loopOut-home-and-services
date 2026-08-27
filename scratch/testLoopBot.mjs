import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getAiResponse } from '../api/controllers/ai-help.controller.js';

await mongoose.connect(process.env.MONGO);
console.log('MongoDB connected for testing LoopBot');

const testPrompts = [
  "Hello LoopBot, what can you do?",
  "Find student room in Mankweng under 3000",
  "Hire a barber in Polokwane",
  "Find car wash service",
  "Are there any events or parties coming up?",
  "I want to buy a phone or laptop",
  "How does escrow protect me?",
  "Show me everything available in Polokwane"
];

for (const p of testPrompts) {
  console.log(`\n========================================`);
  console.log(`🧪 PROMPT: "${p}"`);
  console.log(`========================================`);
  
  let resObj = {};
  const mockReq = { body: { prompt: p } };
  const mockRes = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      resObj = data;
      return this;
    }
  };
  const mockNext = (err) => console.error("Error passed to next:", err);

  await getAiResponse(mockReq, mockRes, mockNext);

  console.log(`Status: ${mockRes.statusCode}`);
  console.log(`Answer:\n${resObj.answer}`);
  console.log(`Action Items Count: ${resObj.actionItems ? resObj.actionItems.length : 0}`);
  if (resObj.actionItems && resObj.actionItems.length > 0) {
    resObj.actionItems.slice(0, 3).forEach((item, i) => {
      console.log(`  [${i+1}] (${item.category}) ${item.title} - ${item.price} @ ${item.location} -> Link: ${item.link}`);
    });
  }
  console.log(`Follow-ups:`, resObj.suggestedFollowUps);
}

await mongoose.connection.close();
console.log('\nAll tests completed successfully!');
process.exit(0);
