'use client';
import React, { useRef, useEffect, useState } from 'react';
import '../globals.css';
import '../globals.css';

const Page: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);

  // State for the sustainability grade with slot machine effect
  const [sustainabilityGrade, setSustainabilityGrade] = useState("A");
  const finalGrade = "A+"; // The final grade to display

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
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        await sendToGetNumAPI(dataUrl);

        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraVisible(false);
      startSlotMachineEffect();
    }, 1000);
  };

  const sendToGetNumAPI = async (base64Image: string) => {
  const sendToGetNumAPI = async (base64Image: string) => {
    try {
      const response = await fetch('/api/getNumber', {
      const response = await fetch('/api/getNumber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64Image }),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64Image }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await sendToFindInfoAPI(data.num);
      } else {
        console.error("Failed to interpret barcode:", data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const sendToFindInfoAPI = async (barcode: string) => {
    try {
      const response = await fetch('/api/findBrand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setBrand(data.answer);
        setTitle(data.title);
      } else {
        console.error(`Failed to interpret barcode: ${barcode}`, data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const startSlotMachineEffect = () => {
    let currentLetterIndex = 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const cycleTime = 50;
    const stopTime = 2000;

    const intervalId = setInterval(() => {
      setSustainabilityGrade(letters[currentLetterIndex]);
      currentLetterIndex = (currentLetterIndex + 1) % letters.length;
    }, cycleTime);

    setTimeout(() => {
      clearInterval(intervalId);
      setSustainabilityGrade(finalGrade);
    }, stopTime);
  };

  return (
    <div className="page-container">
      {isCameraVisible && (
        <div className={`video-wrapper ${fadeOut ? 'fade-out' : ''}`}>
          <video ref={videoRef} autoPlay playsInline className="video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={captureImage} className="capture-button">
            Capture Image
          </button>
        </div>
      )}

      {!isCameraVisible && (
        <>
          <div className="brand-info">
            {brand && <h1 className="brand-name">{brand}</h1>}
            {title && <h2 className="product-title">{title}</h2>}
          </div>

          <div className="info-overlay">
            <div className="sustainability-grade">
              <h3>Grade</h3>
              <p>{sustainabilityGrade}</p>
            </div>

            <div className="sustainability-news">
              <h3>News</h3>
              <p>Latest sustainability efforts</p>
            </div>

            <div className="sources">
              <h3>Sources</h3>
              <ul>
                <li><a href="#source1">Source 1</a></li>
                <li><a href="#source2">Source 2</a></li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
