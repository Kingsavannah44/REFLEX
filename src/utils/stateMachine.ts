import type { DeliveryStatus } from '../types';

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  OPEN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function isValidTransition(current: DeliveryStatus, next: DeliveryStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

export function assertValidTransition(current: DeliveryStatus, next: DeliveryStatus): void {
  if (!isValidTransition(current, next)) {
    const allowed = VALID_TRANSITIONS[current].join(', ') || 'none';
    throw new Error(
      `Invalid status transition: ${current} -> ${next}. Allowed from ${current}: [${allowed}]`,
    );
  }
}
