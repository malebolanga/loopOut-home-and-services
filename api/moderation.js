// moderation.js – Express backend for moderation pipeline
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const { getOffender, upsertOffender } = require('./db');
const { checkRateLimit } = require('./rateLimiter');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

// Helper to call OpenAI moderation endpoint
async function callOpenAIModeration(payload) {
  const response = await axios.post(
    'https://api.openai.com/v1/moderations',
    payload,
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data;
}

// Image moderation endpoint – expects { imageUrl, userId }
app.post('/api/moderate/image', async (req, res) => {
  const { imageUrl, userId } = req.body;
  if (!imageUrl || !userId) return res.status(400).json({ error: 'Missing fields' });

  // Rate‑limit / repeat‑offender check
  const limitResult = await checkRateLimit(userId, 'image');
  if (!limitResult.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', action: 'block' });
  }

  try {
    const result = await callOpenAIModeration({
      model: 'omni-moderation-latest',
      input: [{ type: 'image_url', image_url: { url: imageUrl } }]
    });
    const flagged = result.results[0].flagged;
    const categories = result.results[0].categories;

    // Update offender counters if flagged
    if (flagged) await upsertOffender(userId, 1);

    const riskScore = flagged ? 0.9 : 0.1; // simplistic score
    const action = flagged ? 'block' : 'allow';
    res.json({ flagged, categories, riskScore, action });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

// Text moderation endpoint – expects { text, userId }
app.post('/api/moderate/text', async (req, res) => {
  const { text, userId } = req.body;
  if (!text || !userId) return res.status(400).json({ error: 'Missing fields' });

  const limitResult = await checkRateLimit(userId, 'text');
  if (!limitResult.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', action: 'block' });
  }

  try {
    const result = await callOpenAIModeration({ model: 'omni-moderation-latest', input: [text] });
    const flagged = result.results[0].flagged;
    const categories = result.results[0].categories;
    if (flagged) await upsertOffender(userId, 1);
    const riskScore = flagged ? 0.9 : 0.1;
    const action = flagged ? 'block' : 'allow';
    res.json({ flagged, categories, riskScore, action });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.listen(PORT, () => console.log(`Moderation server listening on port ${PORT}`));
