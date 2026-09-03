import { useEffect, useRef, useState } from "react";
import QrScannerLib from "qr-scanner";

// A genuinely working camera-based scanner - it decodes whatever QR code is
// in view and hands the real decoded string up via onScan. The backend
// validates that exact token server-side and has no manual bypass, so the
// "can't scan" fallback is a real text field for typing the same code in,
// not a one-click skip.
export default function QrScanner({ onScan, onManualConfirm }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [ready, setReady] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState("");

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

  function submitManualCode(e) {
    e.preventDefault();
    if (manualCode.trim()) onManualConfirm(manualCode.trim());
  }

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
        <p className="text-xs text-red-400">Camera unavailable ({cameraError}).</p>
      )}

      {showManualEntry ? (
        <form onSubmit={submitManualCode} className="space-y-2">
          <input
            autoFocus
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Paste or type the delivery code"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg py-2 transition-colors"
          >
            Confirm with this code
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowManualEntry(true)}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
        >
          Can't scan? Enter the code manually
        </button>
      )}
    </div>
  );
}
