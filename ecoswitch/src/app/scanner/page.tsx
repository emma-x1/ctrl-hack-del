'use client'
import React, { useRef, useEffect } from 'react';
import * as ScanditSDK from 'scandit-sdk';
import { BarcodePicker, ScanSettings } from 'scandit-sdk';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    const startScanner = async () => {
      try {
        await ScanditSDK.configure('AojVFg2fKLtZGtmGmQniWwklGVUpLfmaXxcvm5AqQIP+BezAQUDNS5N3+Lt7X5vrnmXRcuZf4YDjRscPHXx73UxTRLTSAbBNEFQoBDIO4F4zX3uaug7k92MCDeskAZB/UAOm0kpDt5iIHciY82obE+RjZEc7PA29YiEfl9ke3/TGHBXguGMxwMdrpXY1eCXNAzukeO0HLeElSCJ/JWz8n9FKozUxCMH33yk4CgkESacgOGTALw7qtw4aM5+jdWFlyQlZ80Y/gLsgHagJ7w0paGc+BqgbJk2hFApgXfQBgt1rLUPMpxQxzqkOyCCEczINOSs97n0gukVYEk6D0R0BWBckZ+oqGHvxMzeSn4xmbKlfRS7BxjB2+C8cWh4Bfh44iFaQbCRMrt10eeCf7RTMB+hdpVPSVB8RzV/Cy2sqlWrOareBUzhG3adZ/L5AVi4nmia4BkBzsKLgeJj99XYRpf1Yb2gIBHs7fXpXufso+0KNLw31w0P/3bsdLLBOH646O1aWwG1cx1pNWRABLDV4gxl2bjAVfB01RE4UguhADcA7DFQDxggWwsFtmj9yXD2LnngYQ4spbzQWRuiT+k5yf7YuEAPBaO9+aHrNTpI+Lj1odCMvOGmW64RT+WIraynIxTrp0G1uq0TVcvmnq1HJAcEVgoWlV5XubWuCVfNPu+SzWJhs8nMw/tBHjRhNbpODAT22b2BqaoD3QheIZnKSEexghti+YUJEdgwtemVXr8QebVCy+BsUgfs5y8wOi+v0YFIccn2rYwdBxJnshJake85lTAgv3m58LNOku28zDmknO/c9Q8nMUQj63lzy6Br+HdSOz8tiVst8fCIK05QlWyO1AED4qCPYBr2sloLEtBcSW5R1W9lUaRTR9a9ate8gkl8xJnBN4fvJuDaYuR1Ki19MtIhGhJE6qb0qm7NiB2ht1fV69QAsrgYCtNuxTZGeDGJwwP9mqMK8bJL0AS8ZXnDKEXCWkNd3Uwrx8vR6fFoRqQt56zVXHnbNPl0DuXwsDW6JCrx+SU5mTpCDrwqTrJJe+u+TjUVfFsyEZU2FcanXv1OOMsjMIeFnA49l2C0m2+8J8YmBO9Aq23fX78L1H5qBQJYw9RLJt1c7jCxW7rtGNyYtsKJ0nvhGGAGzZDj1+SUYov4vtfrgTe5revpXrGr7PMmbtMARnEqZG2hz6paVHZ6IyNC4tGWmvxrSWqdejasinYwIOcuUeyvfmfbJmJ7A6HwEWiubU5eEbnPvOt25BNZsTigBR1d1t7tsa4w7pzBqYLhDfpEjfUUOkP0LtVLHznbnGxXF4pn8FrkvbQ/SrHYpoDCWPbzuFV5loKGuVbgBhlxOCRyhd/c6Vd2r85cEqyx8IReUWVpoO1K6dvPE2c4SDEi3PFVnB4RbZZa5CfIuCqdSIM0yokpEqrgGCAg2UwYXstc7NhhmcA==', {
          engineLocation: 'https://cdn.jsdelivr.net/npm/scandit-sdk@5.x/build',
        });

        const barcodePicker = await BarcodePicker.create(scannerRef.current!, {
          playSoundOnScan: true,
          vibrateOnScan: true,
        });

        const scanSettings = new ScanSettings({
          enabledSymbologies: ['ean13', 'qr', 'code128'],
        });

        barcodePicker.applyScanSettings(scanSettings);

        barcodePicker.on('scan', (scanResult) => {
          scanResult.barcodes.forEach((barcode) => {
            console.log('Scanned barcode:', barcode.data);
            alert(`Scanned barcode: ${barcode.data}`);
          });
        });
      } catch (error) {
        console.error("Error initializing Scandit scanner:", error);
      }
    };

    startCamera();
    startScanner();

    // Clean up the video stream and scanner when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      BarcodePicker.removeAll(); // Clean up Scandit BarcodePicker
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative' }}>
      {/* Camera feed video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', maxWidth: '600px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      />

      {/* Scandit scanner overlay */}
      <div ref={scannerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </div>
  );
};

export default CameraComponent;
