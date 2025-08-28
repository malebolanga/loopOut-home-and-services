import express from 'express';
import { 
  createComment, 
  getComments, 
  likeComment, 
  addReply 
} from '../controllers/comment.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createComment);
router.get('/:listingId', getComments);
router.put('/like/:commentId', verifyToken, likeComment);
router.post('/reply/:commentId', verifyToken, addReply);

export default router;