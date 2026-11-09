import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { cancelOnDemandJob, createOnDemandJob, getWorkerAvailability, listOnDemandJobs, respondToOnDemandJob, updateOnDemandJobStatus, updateWorkerAvailability } from '../controllers/onDemand.controller.js';

const router = express.Router();
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
router.use(verifyToken);
router.get('/availability', wrap(getWorkerAvailability));
router.put('/availability', wrap(updateWorkerAvailability));
router.post('/', wrap(createOnDemandJob));
router.get('/', wrap(listOnDemandJobs));
router.post('/:jobId/respond', wrap(respondToOnDemandJob));
router.patch('/:jobId/status', wrap(updateOnDemandJobStatus));
router.post('/:jobId/cancel', wrap(cancelOnDemandJob));

export default router;
