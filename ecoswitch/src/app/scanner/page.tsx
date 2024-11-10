'use client';
import React, { useRef, useEffect, useState } from 'react';
import '../globals.css';

const Page: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [alt, setAlt] = useState<string | null>(null);
  const [bp1, setBp1] = useState<string | null>(null);
  const [bp2, setBp2] = useState<string | null>(null);
  const [bp3, setBp3] = useState<string | null>(null);
  const [sustainabilityGrade, setSustainabilityGrade] = useState("A");

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
    var element = document.getElementById("projects");
    element.classList.remove("invisible");
    element.classList.add("fade-in");
    setFadeOut(true);

    setTimeout(async () => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
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
        await sendToFindInfoAPI(data.num);
      } else {
        console.error("Failed to interpret barcode:", data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const sendToFindInfoAPI = async (alt: string) => {
    try {
      const response = await fetch('/api/findBrand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setGrade(data.grade);
        setAlt(data.altname);
        setBp1(data.bullet1);
        setBp2(data.bullet2);
        setBp3(data.bullet3);
      } else {
        console.error(`Failed to interpret barcode: ${alt}`, data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const sendToFindAltAPI = async (barcode: string) => {
    try {
      const response = await fetch('/api/findAlt', {
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
    const letters = "ABCDEF";
    const cycleTime = 50;
    const stopTime = 2000;

    const intervalId = setInterval(() => {
      setSustainabilityGrade(letters[currentLetterIndex]);
      currentLetterIndex = (currentLetterIndex + 1) % letters.length;
    }, cycleTime);

    setTimeout(() => {
      clearInterval(intervalId);
      setSustainabilityGrade(grade || "N/A");
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
          </div>
        </>
      )}

      <section id="projects" className="section project invisible">
        <div className="projects__grid">
          <div className="project">
            <h3>EasyASL</h3>
            <p className="project__description">
              Hackathon winner accomplished within 36 hours. EasyASL provides a comprehensive tool for the hard-of-hearing community and other individuals who use American Sign Language (ASL).
            </p>
            <ul className="project__stack">
              <li className="project__stack-item">HTML</li>
              <li className="project__stack-item">Next.js</li>
              <li className="project__stack-item">TypeScript</li>
              <li className="project__stack-item">React</li>
              <li className="project__stack-item">Figma</li>
            </ul>

            <a href="https://github.com/azselim/EasyASL" aria-label="source code" className="link link--icon">
              <i aria-hidden="true" className="fab fa-github"></i>
            </a>
            <a href="https://devpost.com/software/easyasl" aria-label="live preview" className="link link--icon">
              <i aria-hidden="true" className="fas fa-external-link-alt"></i>
            </a>
          </div>

          <div className="project">
            <h3>IFDAA (in progress)</h3>
            <p className="project__description">
              Personal project completed for ECE198 course. The Intelligent Fall Detection Alert Apparatus (IFDAA) provides a robust, cost-effective solution for at-risk individuals.
            </p>
            <ul className="project__stack">
              <li className="project__stack-item">C++</li>
              <li className="project__stack-item">AutoDesk Fusion</li>
              <li className="project__stack-item">draw.io</li>
            </ul>

            <a href="https://github.com" aria-label="source code" className="link link--icon">
              <i aria-hidden="true" className="fab fa-github"></i>
            </a>
            <a href="https://example.com" aria-label="live preview" className="link link--icon">
              <i aria-hidden="true" className="fas fa-external-link-alt"></i>
            </a>
          </div>

          <div className="project">
            <h3>Project 3</h3>
            <p className="project__description">Announcement 11/11/24</p>
            <ul className="project__stack">
              <li className="project__stack-item">???</li>
              <li className="project__stack-item">???</li>
              <li className="project__stack-item">???</li>
            </ul>

            <a href="https://github.com" aria-label="source code" className="link link--icon">
              <i aria-hidden="true" className="fab fa-github"></i>
            </a>
            <a href="https://example.com" aria-label="live preview" className="link link--icon">
              <i aria-hidden="true" className="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
