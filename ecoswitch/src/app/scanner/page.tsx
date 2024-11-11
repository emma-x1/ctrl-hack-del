'use client';
import React, { useRef, useEffect, useState } from 'react';
import Head from 'next/head';
import SqliteQueryComponent from '@/components/SqliteQueryComponent';
import '../globals.css';
import axios from 'axios';

const Page: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [sustainabilityGrade, setSustainabilityGrade] = useState("A");
  const [isLoading, setIsLoading] = useState(false);
  const [isSlotMachineActive, setIsSlotMachineActive] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [summary1, setSummary1] = useState<string | null>(null);
  const [summary2, setSummary2] = useState<string | null>(null);
  const [summary3, setSummary3] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [altBullets1, setAltBullets1] = useState<string | null>(null);
  const [altBullets2, setAltBullets2] = useState<string | null>(null);
  const [altBullets3, setAltBullets3] = useState<string | null>(null);
  const [alt, setAlt] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

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
    const element = document.getElementById("projects");
    element?.classList.remove("invisible");
    element?.classList.add("fade-in");
    setFadeOut(true);
    setIsLoading(true);

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
        console.log(data.num);
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
        await fetchAlt(data.title);
        await fetchBrandSummary(data.answer);
        console.log(data.answer);
        console.log({ brand });
      } else {
        console.error(`Failed to interpret barcode: ${barcode}`, data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const fetchBrandSummary = async (brand: string) => {
    try {
      const response = await fetch('/api/newPull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSummary1(`${data.answer.article1.summary} (${data.answer.article1.source}).`);
        setSummary2(`${data.answer.article2.summary} (${data.answer.article2.source}).`);
        setSummary3(`${data.answer.article3.summary} (${data.answer.article3.source}).`);
      } else {
        console.error(`Failed to interpret brand: ${brand}`, data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const fetchAlt = async (product: string) => {
    try {
      const response = await fetch('/api/findAltv2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAlt(data.answer.altname);
        setAltBullets1(data.answer.bullet1);
        setAltBullets2(data.answer.bullet2);
        setAltBullets3(data.answer.bullet3);
        setThumbnail(data.answer.thumbnail);
      } else {
        console.error(`Failed to interpret brand: ${brand}`, data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const startSlotMachineEffect = () => {
    let currentLetterIndex = 0;
    const letters = "ABCDF";
    const cycleTime = 50;
    setIsSlotMachineActive(true);

    const intervalId = setInterval(() => {
      setSustainabilityGrade(letters[currentLetterIndex]);
      currentLetterIndex = (currentLetterIndex + 1) % letters.length;
    }, cycleTime);

    setTimeout(() => {
      clearInterval(intervalId);
      setSustainabilityGrade(grade || "B");
      setIsSlotMachineActive(false);
    }, 2000);
  };

  useEffect(() => {
    if (grade && !isSlotMachineActive) {
      setIsLoading(false);
      startSlotMachineEffect();
    }
  }, [grade]);

  return (
    <div className="page-container">
      <Head>
        <title>Report</title>
        <link rel="icon" type="image/x-icon" href="./ecoswitch.svg" />
      </Head>

      {isCameraVisible && (
        <div className={`video-wrapper ${fadeOut ? 'fade-out' : ''}`}>
          <video ref={videoRef} autoPlay playsInline className="video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={captureImage} className="capture-button">
            Capture Image
          </button>
        </div>
      )}

      {isLoading && (
        <div className="info-overlay">
          <div className="loading-screen">
            <p>Loading...</p>
          </div>
        </div>
      )}

      {!isCameraVisible && !isLoading && (
        <>
          <div className="brand-info">
            {brand && <h1 className="brand-name">{brand}</h1>}
            {title && <h2 className="product-title">{title}</h2>}
          </div>
        </>
      )}

      {brand && (
        <SqliteQueryComponent
          companyName={brand}
          onGradeUpdate={(fetchedGrade: string) => {
            if (fetchedGrade) {
              setGrade(fetchedGrade);
            }
          }}
        />
      )}

      <section id="projects" className="section invisible">
        <section className="section news">
          <h2 className="section__title">Report</h2>
          <div className="hep">
            <h4 className="hep__description">{summary1}</h4>
          </div>
          <div className="hep">
            <h4 className="hep__description">{summary2}</h4>
          </div>
          <div className="hep">
            <h4 className="hep__description">{summary3}</h4>
          </div>
        </section>

        <div className="projects__grid">
          <div className="project">
            <h3>Assigned grade:</h3>
            <div className="sustainability-grade">
              <p>{sustainabilityGrade}</p>
            </div>
            <h4 className="project__description">
              (Based off proprietary calculation of ecoscore)
            </h4>
          </div>

          <div className="project">
            <h3>Eco-Alternative:</h3>
            <h4 className="ecoalt">{alt}</h4>
            <img src={thumbnail} className="altpic" />
            {/* Placeholder links can be updated or removed */}
          </div>

          <div className="project">
            <h3>Comparison:</h3>
            <ol>
              <li className="bodytext">{altBullets1}</li>
              <li className="bodytext">{altBullets2}</li>
              <li className="bodytext">{altBullets3}</li>
            </ol>
            {/* Placeholder links can be updated or removed */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
