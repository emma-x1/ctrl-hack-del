'use client';
import React, { useRef, useEffect, useState } from 'react';

const Page: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeNumber, setBarcodeNumber] = useState<string | null>(null);

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

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video dimensions
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        // Draw the current video frame onto the canvas
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Convert the canvas image to base64 format
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');

        // Call the API with the captured image
        await sendToAPI(dataUrl);
      }
    }
  };

  const sendToAPI = async (base64Image: string) => {
    try {
      console.log("Base64 Image:", base64Image); // Log the base64 image to verify it's correctly formatted

      const response = await fetch('/api/getNumber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo: base64Image }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log(data);
        setBarcodeNumber(data.num); // Update the barcode number in the state
      } else {
        console.error("Failed to interpret barcode:", data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      {/* Video element for live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', maxWidth: '600px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      />

      {/* Canvas element for capturing images */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Button to capture an image */}
      <button onClick={captureImage} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Capture Image
      </button>

      {/* Display captured barcode number */}
      {barcodeNumber && (
        <div style={{ marginTop: '20px' }}>
          <h3>Barcode Number:</h3>
          <p>{barcodeNumber}</p>
        </div>
      )}
    </div>
  );
};

export default Page;
