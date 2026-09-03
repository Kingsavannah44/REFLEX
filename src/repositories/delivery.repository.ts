import db from '../config/database';
import type { Delivery, DeliveryStatus, DeliveryStatusHistory } from '../types';

const TABLE = 'deliveries';
const HISTORY_TABLE = 'delivery_status_history';

export const DeliveryRepository = {
  async create(data: {
    id: string;
    created_by: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    item_description: string;
    qr_token: string;
  }): Promise<Delivery> {
    const [delivery] = await db<Delivery>(TABLE)
      .insert({ ...data, status: 'OPEN' })
      .returning('*');
    return delivery!;
  },

  async findById(id: string): Promise<Delivery | undefined> {
    return db<Delivery>(TABLE).where({ id }).first();
  },

  async findOpen(): Promise<Delivery[]> {
    return db<Delivery>(TABLE).where({ status: 'OPEN' }).orderBy('created_at', 'desc');
  },

  async findByRider(riderId: string): Promise<Delivery[]> {
    return db<Delivery>(TABLE)
      .where({ assigned_rider_id: riderId })
      .whereNotIn('status', ['DELIVERED', 'CANCELLED'])
      .orderBy('assigned_at', 'desc');
  },

  async assignRider(deliveryId: string, riderId: string): Promise<Delivery | undefined> {
    const [updated] = await db<Delivery>(TABLE)
      .where({ id: deliveryId, status: 'OPEN' })
      .update({
        assigned_rider_id: riderId,
        status: 'ASSIGNED',
        assigned_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*');
    return updated;
  },

  async updateStatus(
    deliveryId: string,
    expectedStatus: DeliveryStatus,
    newStatus: DeliveryStatus,
  ): Promise<Delivery | undefined> {
    const timestampFields: Partial<Record<DeliveryStatus, string>> = {
      PICKED_UP: 'picked_up_at',
      DELIVERED: 'delivered_at',
    };

    const fields: Record<string, unknown> = {
      status: newStatus,
      updated_at: db.fn.now(),
    };

    const tsField = timestampFields[newStatus];
    if (tsField) fields[tsField] = db.fn.now();

    const [updated] = await db<Delivery>(TABLE)
      .where({ id: deliveryId, status: expectedStatus })
      .update(fields)
      .returning('*');

    return updated;
  },

  async appendHistory(data: {
    delivery_id: string;
    changed_by: string;
    previous_status: DeliveryStatus;
    new_status: DeliveryStatus;
    notes?: string;
  }): Promise<DeliveryStatusHistory> {
    const [row] = await db<DeliveryStatusHistory>(HISTORY_TABLE).insert(data).returning('*');
    return row!;
  },

  async getHistory(deliveryId: string): Promise<DeliveryStatusHistory[]> {
    return db<DeliveryStatusHistory>(HISTORY_TABLE)
      .where({ delivery_id: deliveryId })
      .orderBy('created_at', 'asc');
  },
};
