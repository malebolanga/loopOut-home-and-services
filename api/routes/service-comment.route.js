import express from 'express';
import { 
  createServiceComment, 
  getServiceComments, 
  likeServiceComment, 
  addServiceReply,
  deleteServiceComment
} from '../controllers/service-comment.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, createServiceComment);
router.get('/:serviceId', getServiceComments);
router.put('/like/:commentId', verifyToken, likeServiceComment);
router.post('/reply/:commentId', verifyToken, addServiceReply);
router.delete('/:commentId', verifyToken, deleteServiceComment);

export default router;