'use client';
import React, { useRef, useEffect, useState } from 'react';
import '../globals.css';

const Page: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

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

  const captureImage = () => {
    setFadeOut(true);

    setTimeout(() => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraVisible(false);
    }, 1000);
  };

  return (
    <div className="page-container">
      {/* Conditionally render the camera and fade-out effect */}
      {isCameraVisible && (
        <div className={`video-wrapper ${fadeOut ? 'fade-out' : ''}`}>
          <video ref={videoRef} autoPlay playsInline className="video" />
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
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
