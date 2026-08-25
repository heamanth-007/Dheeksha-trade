import { Router } from 'express';
import {
  getParticulars,
  getParticularById,
  createParticular,
  deleteParticular,
} from '../controllers/particularController';

const router = Router();

router.route('/').get(getParticulars).post(createParticular);
router.route('/:id').get(getParticularById).delete(deleteParticular);

export default router;
