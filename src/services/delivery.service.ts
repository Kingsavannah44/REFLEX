import { randomUUID } from 'crypto';
import { DeliveryRepository } from '../repositories/delivery.repository';
import { UserRepository } from '../repositories/user.repository';
import { generateQrToken, verifyQrToken } from '../utils/qr';
import { assertValidTransition } from '../utils/stateMachine';
import type {
  CreateDeliveryInput,
  AssignRiderInput,
  UpdateStatusInput,
  ConfirmDeliveryInput,
} from '../validators/delivery.validators';
import type { Delivery, DeliveryStatus } from '../types';

function serviceError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export const DeliveryService = {
  async create(input: CreateDeliveryInput, createdBy: string): Promise<Delivery> {
    const id = randomUUID();
    return DeliveryRepository.create({
      id,
      created_by: createdBy,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      delivery_address: input.deliveryAddress,
      item_description: input.itemDescription,
      qr_token: generateQrToken(id),
    });
  },

  async getById(deliveryId: string) {
    const delivery = await DeliveryRepository.findById(deliveryId);
    if (!delivery) throw serviceError('Delivery not found.', 404);

    const history = await DeliveryRepository.getHistory(deliveryId);
    return { ...delivery, statusHistory: history };
  },

  async getOpenDeliveries(): Promise<Delivery[]> {
    return DeliveryRepository.findOpen();
  },

  async assignRider(deliveryId: string, input: AssignRiderInput, dispatcherId: string): Promise<Delivery> {
    const delivery = await DeliveryRepository.findById(deliveryId);
    if (!delivery) throw serviceError('Delivery not found.', 404);

    if (delivery.status !== 'OPEN') {
      throw serviceError(
        `Only OPEN deliveries can be assigned. This one is ${delivery.status}.`,
        409,
      );
    }

    const rider = await UserRepository.findById(input.riderId);
    if (!rider) throw serviceError('Rider not found.', 404);
    if (rider.role !== 'rider') throw serviceError('That user is not a rider.', 400);
    if (!rider.is_active) throw serviceError('That rider account is inactive.', 400);

    // Atomic WHERE status = 'OPEN' means a second concurrent dispatcher will get undefined back
    const updated = await DeliveryRepository.assignRider(deliveryId, input.riderId);
    if (!updated) {
      throw serviceError('Delivery was just assigned by someone else. Please refresh.', 409);
    }

    await DeliveryRepository.appendHistory({
      delivery_id: deliveryId,
      changed_by: dispatcherId,
      previous_status: 'OPEN',
      new_status: 'ASSIGNED',
    });

    return updated;
  },

  async getRiderDeliveries(riderId: string): Promise<Delivery[]> {
    return DeliveryRepository.findByRider(riderId);
  },

  async updateStatus(deliveryId: string, input: UpdateStatusInput, riderId: string): Promise<Delivery> {
    const delivery = await DeliveryRepository.findById(deliveryId);
    if (!delivery) throw serviceError('Delivery not found.', 404);

    if (delivery.assigned_rider_id !== riderId) {
      throw serviceError('You are not the assigned rider for this delivery.', 403);
    }

    const newStatus = input.status as DeliveryStatus;

    if (newStatus === 'DELIVERED') {
      throw serviceError(
        'Use POST /api/deliveries/:id/confirm with the QR token to mark a delivery as delivered.',
        400,
      );
    }

    assertValidTransition(delivery.status, newStatus);

    const updated = await DeliveryRepository.updateStatus(deliveryId, delivery.status, newStatus);
    if (!updated) {
      throw serviceError('Update failed due to a concurrent change. Please retry.', 409);
    }

    await DeliveryRepository.appendHistory({
      delivery_id: deliveryId,
      changed_by: riderId,
      previous_status: delivery.status,
      new_status: newStatus,
      notes: input.notes,
    });

    return updated;
  },

  async confirmDelivery(deliveryId: string, input: ConfirmDeliveryInput, riderId: string) {
    const delivery = await DeliveryRepository.findById(deliveryId);
    if (!delivery) throw serviceError('Delivery not found.', 404);

    // Idempotent — scanning a second time is fine
    if (delivery.status === 'DELIVERED') {
      const history = await DeliveryRepository.getHistory(deliveryId);
      return { ...delivery, statusHistory: history };
    }

    if (delivery.assigned_rider_id !== riderId) {
      throw serviceError('You are not the assigned rider for this delivery.', 403);
    }

    if (delivery.status !== 'PICKED_UP') {
      throw serviceError(
        `Delivery must be in PICKED_UP status before confirming. Current: ${delivery.status}`,
        409,
      );
    }

    if (!verifyQrToken(input.qrToken, deliveryId)) {
      throw serviceError('QR token does not match this delivery.', 400);
    }

    const updated = await DeliveryRepository.updateStatus(deliveryId, 'PICKED_UP', 'DELIVERED');
    if (!updated) {
      throw serviceError('Confirmation failed due to a concurrent change. Please retry.', 409);
    }

    await DeliveryRepository.appendHistory({
      delivery_id: deliveryId,
      changed_by: riderId,
      previous_status: 'PICKED_UP',
      new_status: 'DELIVERED',
      notes: 'Confirmed via QR scan.',
    });

    const history = await DeliveryRepository.getHistory(deliveryId);
    return { ...updated, statusHistory: history };
  },
};
