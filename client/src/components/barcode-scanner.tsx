import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Zap, ZapOff, Camera, Keyboard } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
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

  const playBeepSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillator for beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure beep sound - high pitch "beep"
      oscillator.frequency.value = 1000; // 1000 Hz frequency
      oscillator.type = 'sine';
      
      // Set volume
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      // Play beep for 0.1 seconds
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, 200);
    } catch (error) {
      console.error("Error playing beep sound:", error);
    }
  };

  const startScanner = async () => {
    try {
      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext;
      const inIframe = window.self !== window.top;
      
      console.log("Camera diagnostics:", {
        isSecureContext,
        inIframe,
        userAgent: navigator.userAgent,
        location: window.location.href
      });
      
      if (!isSecureContext) {
        setError("Камера требует защищенное соединение (HTTPS). В предварительном просмотре Replit камера может не работать. Опубликуйте приложение для полной функциональности.");
        return;
      }
      
      if (inIframe) {
        console.warn("Running inside iframe - camera may not work");
        setError("Камера может не работать в режиме предварительного просмотра. Используйте ручной ввод штрихкода или опубликуйте приложение.");
        return;
      }

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
            
            // Play beep sound
            playBeepSound();
            
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

    } catch (err: any) {
      console.error("Scanner error:", err);
      
      // Provide specific error messages based on error type
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Доступ к камере заблокирован. Разрешите доступ к камере в настройках браузера и обновите страницу.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("Камера не найдена. Убедитесь, что устройство имеет камеру.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError("Камера используется другим приложением. Закройте другие приложения, использующие камеру, и попробуйте снова.");
      } else if (err.name === "OverconstrainedError") {
        setError("Камера не поддерживает требуемые настройки.");
      } else if (err.name === "NotSupportedError") {
        setError("Камера не поддерживается в этом браузере или требуется HTTPS.");
      } else {
        setError(`Не удалось запустить камеру: ${err.message || "Неизвестная ошибка"}`);
      }
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      playBeepSound();
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      onScanSuccess(manualInput.trim());
      stopScanner();
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
        {hasFlash && !error && !showManualInput && (
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
        {error || showManualInput ? (
          <Card className="p-6 max-w-md w-full">
            <div className="flex flex-col items-center gap-4 text-center">
              {error && !showManualInput ? (
                <>
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Ошибка камеры</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      onClick={onClose} 
                      data-testid="button-close-error"
                      className="flex-1"
                    >
                      Закрыть
                    </Button>
                    <Button 
                      onClick={() => setShowManualInput(true)} 
                      data-testid="button-manual-input"
                      className="flex-1"
                    >
                      <Keyboard className="h-4 w-4 mr-2" />
                      Ввести вручную
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Keyboard className="h-12 w-12 text-muted-foreground" />
                  <div className="w-full">
                    <h3 className="font-medium text-lg mb-2">Ввод штрихкода</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Введите штрихкод товара вручную
                    </p>
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Введите штрихкод"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        autoFocus
                        data-testid="input-manual-barcode"
                        className="text-center text-lg"
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => {
                            setShowManualInput(false);
                            setManualInput("");
                            if (!error) {
                              startScanner();
                            }
                          }} 
                          data-testid="button-cancel-manual"
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={!manualInput.trim()}
                          data-testid="button-submit-manual"
                          className="flex-1"
                        >
                          Готово
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}
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
      {!error && !showManualInput && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-background to-transparent">
          <p className="text-sm text-muted-foreground mb-3">
            Наведите камеру на штрихкод
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              stopScanner();
              setShowManualInput(true);
            }}
            data-testid="button-switch-to-manual"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Ввести вручную
          </Button>
        </div>
      )}
    </div>
  );
}
