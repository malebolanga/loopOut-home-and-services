// src/routes/api/ai/help.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const systemPrompt = `
You are an expert assistant for LoupeOut, a real estate platform. 
Your purpose is to help users verify listings and services. Provide:

1. Specific verification steps
2. Safety recommendations
3. Platform-specific features that can help
4. Red flags to watch for
5. Advice on secure transactions

Keep responses concise (2-4 paragraphs max) and focused on safety and verification.
`;

export default async function handler(req, res) {
  const { question } = req.body;
  
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.3,
      max_tokens: 350
    });
    
    res.status(200).json({
      answer: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}