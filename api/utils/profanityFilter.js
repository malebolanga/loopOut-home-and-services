import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const badWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'slut', 'whore', 'motherfucker', 'nigger', 'faggot'
];

export const hasProfanity = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return badWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
};

export const logProfanityEvent = (userId, type, text) => {
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logPath = path.join(logDir, 'profanity.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] User: ${userId || 'guest'} | Type: ${type} | Text: "${text}"\n`;
  
  fs.appendFileSync(logPath, logMessage, 'utf8');
  console.warn(`[Profanity Filter Triggered] User: ${userId || 'guest'} | Type: ${type}`);
};
