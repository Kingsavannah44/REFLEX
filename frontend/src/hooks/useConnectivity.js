import { useCallback, useEffect, useState } from "react";
import { flushQueue, getQueueLength } from "../offlineQueue";
import { api } from "../api";

// Real connectivity tracking via the browser's own online/offline events -
// not a manual toggle. When the connection comes back, it flushes anything
// queued while offline.
export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(getQueueLength());

  const refreshQueueLength = useCallback(() => setQueueLength(getQueueLength()), []);

  useEffect(() => {
    async function handleOnline() {
      setIsOnline(true);
      await flushQueue(api);
      refreshQueueLength();
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshQueueLength]);

  return { isOnline, queueLength, refreshQueueLength };
}
