import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
    const videoRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [streamActive, setStreamActive] = useState(false);
    const scannerRef = useRef(null);

    // Manual Camera Activation
    const startCamera = async () => {
        try {
            console.log("Requesting camera access...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });

            if (videoRef.current) {
                console.log("Attaching stream to video element");
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", true); // iOS compatibility

                await videoRef.current.play();
                setStreamActive(true);
                setScanning(true);

                // Initialize Scanner ONLY after stream is valid
                initializeScanner(stream);
            }
        } catch (err) {
            console.error("Camera access failed:", err);
            onScanError ? onScanError("Camera access denied or failed") : alert("Could not access camera");
        }
    };

    const initializeScanner = (stream) => {
        if (scannerRef.current) return;

        // We use Html5Qrcode class to scan the video element or frames
        const html5QrCode = new Html5Qrcode("reader-hidden");
        scannerRef.current = html5QrCode;

        // Since we are managing the video manually as requested, we need to feed data to the scanner.
        // Html5Qrcode doesn't easily accept an external video element for continuous scanning 
        // without taking over the UI. 
        // WORKAROUND: We use an interval to "scan" the video frame using the library's compute.
        // Note: This is a manual implementation of what the library usually does.

        const scanLoop = setInterval(() => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

            // Create a temporary canvas to capture frame
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            // Use the library to scan the canvas/image
            // html5-qrcode's scanFileV2 expects a File or Blob. 
            // This might be slow. 
            // ALTERNATIVE: Use the library's start() method BUT we need to respect the "Manual Video" constraint.
            // If we use start(), it creates its own video.

            // Let's try to get the blob and scan it. 
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                try {
                    const file = new File([blob], "frame.png", { type: "image/png" });
                    const val = await html5QrCode.scanFileV2(file, false);
                    if (val && val.decodedText) {
                        handleDecode(val.decodedText);
                    }
                } catch (e) {
                    // No QR found in frame, ignore
                }
            }, 'image/png');

        }, 500); // Scan every 500ms (2fps) to avoid lag

        // Store interval to clear later
        scannerRef.current.interval = scanLoop;
    };

    const handleDecode = (decodedText) => {
        try {
            const parsed = JSON.parse(decodedText);
            onScanSuccess(parsed);
            stopCamera();
        } catch (e) {
            console.warn("QR is not JSON:", decodedText);
        }
    };

    const stopCamera = () => {
        if (scannerRef.current && scannerRef.current.interval) {
            clearInterval(scannerRef.current.interval);
        }

        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setScanning(false);
        setStreamActive(false);
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
            {/* Hidden div for Html5Qrcode constructor requirement */}
            <div id="reader-hidden" style={{ display: 'none' }}></div>

            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 border border-gray-700">
                {!streamActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Camera Offline</p>
                    </div>
                )}
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                />

                {/* Overlay guides */}
                {streamActive && (
                    <div className="absolute inset-0 border-2 border-indigo-500/50 m-8 rounded-lg pointer-events-none animate-pulse"></div>
                )}
            </div>

            {!scanning ? (
                <button
                    onClick={startCamera}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-lg"
                >
                    Activate Scanner
                </button>
            ) : (
                <p className="text-indigo-400 animate-pulse text-sm">Scanning...</p>
            )}

            <p className="text-center text-gray-500 mt-4 text-xs">
                Ensure good lighting and hold steady.
            </p>
        </div>
    );
};

export default QRScanner;
