import { errorHandler } from '../utils/error.js';

export const getAiResponse = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return next(errorHandler(400, 'Prompt is required'));
    }

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
    
    let answer = "";
    const lowerPrompt = prompt.toLowerCase();

    // Very basic mock responses based on keywords
    if (lowerPrompt.includes('book') || lowerPrompt.includes('reserve')) {
      answer = "To book a service or property, simply navigate to the listing page, select your preferred dates or service type, and click the 'Book Now' or 'Check availability' button. Ensure you've completed your identity verification to enable seamless instant bookings!";
    } else if (lowerPrompt.includes('verify') || lowerPrompt.includes('identity')) {
      answer = "Verification is a key part of our trusted community! You can verify your profile from the 'Mission Control' dashboard. It only takes two minutes and unlocks all premium features, letting hosts and service providers know you're fully verified.";
    } else if (lowerPrompt.includes('payment') || lowerPrompt.includes('pay')) {
      answer = "Payments are completely secure and are held in escrow until the service or stay is successfully completed. We support Visa, MasterCard, and direct EFT. If you experience any issues at checkout, let me know!";
    } else if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi ')) {
      answer = "Hello there! I'm the Masterpiece AI Assistant. I can help you with bookings, resolving issues, understanding how verification works, or even finding the right service for you. What do you need help with today?";
    } else if (lowerPrompt.includes('cancel') || lowerPrompt.includes('refund')) {
      answer = "Cancellations depend on the specific host's or professional's policy. Generally, cancelling 24 hours prior to the experience guarantees a full refund. You can manage your bookings directly from the Trips tab in your dashboard.";
    } else {
      answer = "I understand you're asking about that. As an AI assistant built to help navigate the Masterpiece ecosystem, I recommend checking out our Help Center documentation or specifying your question. Are you trying to book a service, list a property, or troubleshoot your account?";
    }

    res.status(200).json({
      success: true,
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};
