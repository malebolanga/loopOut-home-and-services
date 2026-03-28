import express from 'express';
// Assuming verifyToken utility exists based on standard patterns
import { verifyToken } from '../utils/verifyUser.js'; 
import { sendMessage, getConversations, getMessages, deleteConversation, getOrCreateConversation } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send', verifyToken, sendMessage);
router.get('/conversations', verifyToken, getConversations);
router.get('/conversation/:userId', verifyToken, getOrCreateConversation);
router.get('/:conversationId', verifyToken, getMessages);
router.delete('/:conversationId', verifyToken, deleteConversation);

export default router;
