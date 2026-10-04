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
