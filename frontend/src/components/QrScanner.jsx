import { useEffect, useRef, useState } from "react";
import QrScannerLib from "qr-scanner";

// A genuinely working camera-based scanner (not a simulated button) - it
// decodes whatever QR code is in view. There's no backend-issued token to
// validate yet (that needs a qr_token field generated at order creation,
// which isn't built), so for now any successfully decoded code confirms
// delivery. Falls back to a manual button if the camera can't be reached.
export default function QrScanner({ onScan, onManualConfirm }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!videoRef.current) return;

    const scanner = new QrScannerLib(
      videoRef.current,
      (result) => {
        if (mounted) onScan(typeof result === "string" ? result : result.data);
      },
      {
        // The library's own built-in scan-region/outline overlay is disabled
        // in favor of the custom viewfinder frame drawn below - running both
        // at once produced two mismatched overlapping boxes.
        highlightScanRegion: false,
        highlightCodeOutline: false,
        preferredCamera: "environment",
      }
    );
    scannerRef.current = scanner;

    scanner
      .start()
      .then(() => mounted && setReady(true))
      .catch((err) => mounted && setCameraError(err?.message || "Camera unavailable"));

    return () => {
      mounted = false;
      scanner.stop();
      scanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

        {/* Viewfinder frame, purely decorative, drawn over the real video feed. */}
        <div className="absolute inset-6 pointer-events-none">
          <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
          <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
        </div>

        {!ready && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-300 font-mono">
            Starting camera…
          </div>
        )}
      </div>

      {cameraError && (
        <p className="text-xs text-red-400">
          Camera unavailable ({cameraError}). Confirm manually instead:
        </p>
      )}

      <button
        onClick={onManualConfirm}
        className="w-full text-center text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
      >
        {cameraError ? "Confirm delivery manually" : "Can't scan? Confirm manually"}
      </button>
    </div>
  );
}
