import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createDeliverySchema,
  assignRiderSchema,
  updateStatusSchema,
  confirmDeliverySchema,
} from '../validators/delivery.validators';

const router = Router();

router.use(authenticate);

router.get('/open', authorize('dispatcher'), DeliveryController.getOpen);
router.get('/assigned', authorize('rider'), DeliveryController.getAssigned);

router.post('/', authorize('retailer_staff'), validate(createDeliverySchema), DeliveryController.create);
router.get('/:id', authorize('retailer_staff', 'dispatcher', 'rider'), DeliveryController.getById);
router.put('/:id/assign', authorize('dispatcher'), validate(assignRiderSchema), DeliveryController.assignRider);
router.put('/:id/status', authorize('rider'), validate(updateStatusSchema), DeliveryController.updateStatus);
router.post('/:id/confirm', authorize('rider'), validate(confirmDeliverySchema), DeliveryController.confirmDelivery);

export default router;
