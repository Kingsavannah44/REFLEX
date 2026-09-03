import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize('dispatcher'), DeliveryController.getRiders);

export default router;
