import type { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery.service';
import { UserRepository } from '../repositories/user.repository';
import { sendSuccess, sendError } from '../utils/response';

type ServiceError = Error & { statusCode: number };

function isServiceError(err: unknown): err is ServiceError {
  return err instanceof Error && 'statusCode' in err;
}

function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (isServiceError(err)) return sendError(res, err.message, err.statusCode);
  next(err);
}

export const DeliveryController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await DeliveryService.create(req.body, req.user!.userId);
      sendSuccess(res, delivery, 201);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  // /open and /assigned must be registered before /:id in the router
  async getOpen(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deliveries = await DeliveryService.getOpenDeliveries();
      sendSuccess(res, deliveries);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  async getAssigned(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deliveries = await DeliveryService.getRiderDeliveries(req.user!.userId);
      sendSuccess(res, deliveries);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await DeliveryService.getById(req.params['id']!);
      sendSuccess(res, delivery);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  async assignRider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await DeliveryService.assignRider(
        req.params['id']!,
        req.body,
        req.user!.userId,
      );
      sendSuccess(res, delivery);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await DeliveryService.updateStatus(
        req.params['id']!,
        req.body,
        req.user!.userId,
      );
      sendSuccess(res, delivery);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  async confirmDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await DeliveryService.confirmDelivery(
        req.params['id']!,
        req.body,
        req.user!.userId,
      );
      sendSuccess(res, delivery);
    } catch (err) {
      handleError(err, res, next);
    }
  },

  async getRiders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riders = await UserRepository.findActiveByRole('rider');
      sendSuccess(res, riders);
    } catch (err) {
      handleError(err, res, next);
    }
  },
};
