import express from 'express';
import { 
  createEventComment, 
  getEventComments, 
  likeEventComment, 
  addEventReply,
  deleteEventComment
} from '../controllers/event-comment.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createEventComment);
router.get('/:eventId', getEventComments);
router.put('/like/:commentId', verifyToken, likeEventComment);
router.post('/reply/:commentId', verifyToken, addEventReply);
router.delete('/:commentId', verifyToken, deleteEventComment);

export default router;