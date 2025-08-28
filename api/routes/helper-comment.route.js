import express from 'express';
import { 
  createHelperComment, 
  getHelperComments, 
  likeHelperComment, 
  addHelperReply,
  deleteHelperComment
} from '../controllers/helper-comment.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createHelperComment);
router.get('/:helperId', getHelperComments);
router.put('/like/:commentId', verifyToken, likeHelperComment);
router.post('/reply/:commentId', verifyToken, addHelperReply);
router.delete('/:commentId', verifyToken, deleteHelperComment);

export default router;