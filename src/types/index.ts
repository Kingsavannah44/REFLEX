export type UserRole = 'retailer_staff' | 'dispatcher' | 'rider';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type DeliveryStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Delivery {
  id: string;
  created_by: string;
  assigned_rider_id: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  item_description: string;
  status: DeliveryStatus;
  qr_token: string;
  assigned_at: Date | null;
  picked_up_at: Date | null;
  delivered_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DeliveryStatusHistory {
  id: string;
  delivery_id: string;
  changed_by: string;
  previous_status: DeliveryStatus;
  new_status: DeliveryStatus;
  notes: string | null;
  created_at: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
