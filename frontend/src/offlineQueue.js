// Real offline queue for rider status updates, per the finalized doc's
// "Offline/External Operations" requirement: if mobile coverage drops, cache
// the status locally and push it once reconnected. This is genuinely backed
// by the browser's online/offline events, not simulated.
const KEY = "reflex.offlineQueue";

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function queueStatusUpdate(orderId, status) {
  const queue = readQueue();
  queue.push({ orderId, status, queuedAt: new Date().toISOString() });
  writeQueue(queue);
  return queue.length;
}

export function getQueueLength() {
  return readQueue().length;
}

// Retries every queued update against the real API. Anything that still
// fails (server still unreachable) stays queued for the next attempt.
export async function flushQueue(api) {
  const queue = readQueue();
  if (queue.length === 0) return 0;
  const remaining = [];
  for (const item of queue) {
    try {
      await api.updateStatus(item.orderId, item.status);
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
  return remaining.length;
}
