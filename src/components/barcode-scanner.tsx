'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startScanner = useCallback(async () => {
    setError('');
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode('barcode-scanner-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Error al iniciar cámara. Verifica que tengas permiso.');
      setScanning(false);
    }
  }, [onScan]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div id="barcode-scanner-reader" className="w-full rounded-lg overflow-hidden bg-black"></div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cerrar
        </Button>
      </div>
    </div>
  );
}