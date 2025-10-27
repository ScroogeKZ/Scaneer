import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Zap, ZapOff, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
      // Clean up media stream on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError("Камера не найдена на устройстве");
        return;
      }

      // Try to use back camera on mobile
      const backCamera = devices.find((device) =>
        device.label.toLowerCase().includes("back")
      );
      const cameraId = backCamera?.id || devices[0].id;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 280, height: 200 },
          aspectRatio: 1.4,
        },
        (decodedText) => {
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            // Vibrate on successful scan if available
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            onScanSuccess(decodedText);
            stopScanner();
          }
        },
        undefined
      );

      setIsScanning(true);

      // Check if flash is available and store media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      mediaStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        setHasFlash(true);
      }

    } catch (err) {
      console.error("Scanner error:", err);
      setError("Не удалось запустить камеру. Проверьте разрешения.");
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
          setIsScanning(false);
        })
        .catch((err) => console.error("Error stopping scanner:", err));
    }
  };

  const toggleFlash = async () => {
    try {
      if (!mediaStreamRef.current) {
        console.error("No media stream available");
        return;
      }
      
      const track = mediaStreamRef.current.getVideoTracks()[0];
      if (!track) {
        console.error("No video track available");
        return;
      }

      await track.applyConstraints({
        advanced: [{ torch: !flashOn } as any]
      });
      setFlashOn(!flashOn);
    } catch (err) {
      console.error("Flash toggle error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-scanner"
        >
          <X className="h-6 w-6" />
        </Button>
        {hasFlash && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFlash}
            data-testid="button-toggle-flash"
          >
            {flashOn ? <Zap className="h-6 w-6" /> : <ZapOff className="h-6 w-6" />}
          </Button>
        )}
      </div>

      {/* Scanner area */}
      <div className="flex flex-col items-center justify-center h-full px-4">
        {error ? (
          <Card className="p-6 max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-lg mb-2">Ошибка камеры</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={onClose} data-testid="button-close-error">
                Закрыть
              </Button>
            </div>
          </Card>
        ) : (
          <div className="relative">
            {/* Scanner viewport */}
            <div 
              id="barcode-reader" 
              className="rounded-lg overflow-hidden shadow-lg"
              style={{ width: "100%", maxWidth: "500px" }}
            />
            
            {/* Corner markers for scanning area */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg pointer-events-none" />
          </div>
        )}
      </div>

      {/* Bottom instruction text */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-background to-transparent">
          <p className="text-sm text-muted-foreground">
            Наведите камеру на штрихкод
          </p>
        </div>
      )}
    </div>
  );
}
