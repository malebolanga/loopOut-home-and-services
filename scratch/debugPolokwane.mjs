import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getAiResponse } from '../api/controllers/ai-help.controller.js';

dotenv.config();
await mongoose.connect(process.env.MONGO);

const p = "Show me everything available in Polokwane";
let resObj = {};
const mockReq = { body: { prompt: p } };
const mockRes = {
  status(code) { this.statusCode = code; return this; },
  json(data) { resObj = data; return this; }
};
await getAiResponse(mockReq, mockRes, (err) => console.error(err));

console.log('Result Answer:\n', resObj.answer);
console.log('Action items:', resObj.actionItems.length);
resObj.actionItems.forEach(item => console.log('-', item.category, item.title, item.location));

await mongoose.connection.close();
process.exit(0);
