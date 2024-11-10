'use client';
import React, { useRef, useEffect, useState } from 'react';
import '../globals.css';

const Page: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
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
    setFadeOut(true);

    setTimeout(async () => {
      if (videoRef.current && canvasRef.current) {
        // Capture image from video feed
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Convert captured image to base64
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');

        // Send to API
        await sendToAPI(dataUrl);

        // Stop the video stream
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraVisible(false);
    }, 1000);
  };

  const sendToAPI = async (base64Image: string) => {
    try {
      const response = await fetch('/api/getNumber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64Image }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setBarcodeNumber(data.num); // Update the barcode number in the state
      } else {
        console.error("Failed to interpret barcode:", data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  return (
    <div className="page-container">
      {/* Conditionally render the camera and fade-out effect */}
      {isCameraVisible && (
        <div className={`video-wrapper ${fadeOut ? 'fade-out' : ''}`}>
          <video ref={videoRef} autoPlay playsInline className="video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={captureImage} className="capture-button">
            Capture Image
          </button>
        </div>
      )}

      {/* Information Overlay - appears after camera is removed */}
      {!isCameraVisible && (
        <>
          {/* Company Name */}
          <h1 className="company-name">Company Name</h1>

          <div className="info-overlay">
            {/* Sustainability Grade (Top Left) */}
            <div className="sustainability-grade">
              <h3>Grade</h3>
              <p>A+</p>
            </div>

            {/* Sustainability News (Top Right) */}
            <div className="sustainability-news">
              <h3>News</h3>
              <p>Latest sustainability efforts</p>
            </div>

            {/* Sources (Bottom Right) */}
            <div className="sources">
              <h3>Sources</h3>
              <ul>
                <li><a href="#source1">Source 1</a></li>
                <li><a href="#source2">Source 2</a></li>
              </ul>
            </div>

            {/* Display Barcode Number */}
            {barcodeNumber && (
              <div className="barcode-number">
                <h3>Barcode Number:</h3>
                <p>{barcodeNumber}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
