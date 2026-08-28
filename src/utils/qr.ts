import crypto from 'crypto';
import { env } from '../config/env';

// Token format: base64(deliveryId).hmac-sha256-signature
// This lets us verify a scan without an extra DB lookup in the future.

export function generateQrToken(deliveryId: string): string {
  const hmac = crypto.createHmac('sha256', env.qrHmacSecret);
  hmac.update(deliveryId);
  const sig = hmac.digest('hex');
  const encoded = Buffer.from(deliveryId).toString('base64');
  return `${encoded}.${sig}`;
}

export function verifyQrToken(token: string, deliveryId: string): boolean {
  const expected = generateQrToken(deliveryId);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
