'use client';
import React, { useRef, useEffect, useState } from 'react';
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
  const [summary1, setSummary1] = useState<string | null>(null); // State for the sustainability summary
  const [summary2, setSummary2] = useState<string | null>(null);
  const [summary3, setSummary3] = useState<string | null>(null);
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
    console.log("loading is true")

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
        const brand = data.answer;
        console.log(data);
        setTitle(data.title);
        await fetchImage(data.title);
        await fetchBrandSummary(data.answer); // Fetch sustainability summary once brand is set
        console.log(data.answer)
        console.log({brand})
      } else {
        console.error(`Failed to interpret barcode: ${barcode}`, data.failedReason);
      }
    } catch (error) {
      console.error("Error calling the interpret barcode API:", error);
    }
  };

  const fetchImage = async (searchTerm: string) => {
    try {
      const subscriptionKey = process.env.NEXT_PUBLIC_BING_API_KEY;
      if (!subscriptionKey) {
        throw new Error('The BING_API_KEY environment variable is missing.');
      }
      const endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';

      const response = await axios.get(endpoint, {
        params: { q: searchTerm, count: 1 },
        headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey },
      });

      if (response.data.value && response.data.value.length > 0) {
        const firstImageResult = response.data.value[0];
        setImageUrl(firstImageResult.contentUrl);
      } else {
        setError('No images found.');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      setError('Error fetching image.');
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
        console.log({data});
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
    if (grade ) {
      setIsLoading(false);
      console.log("loading is false")
      startSlotMachineEffect();
    }
    // if (grade && !isSlotMachineActive) {
    //   setIsLoading(false);
    //   console.log("loading is false")
    //   startSlotMachineEffect();
    // }
  }, [grade]);

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

          <div className="info-overlay">
            <div className="sustainability-grade">
              <h3>Grade</h3>
              <p>{sustainabilityGrade}</p>
            </div>
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

      <section id="projects" class="section invisible">
      {summary1 && (
        <section id= "projects" class="section news">
        <h2 class="section__title">News</h2>
        <div class="hep">
            <h4 class="hep__description">
              {summary1}
            </h4>
          </div>
          <div class="hep">
            <h4 class="hep__description">
              {summary2}
            </h4>
          </div>
          <div class="hep">
            <h4 class="hep__description">
              {summary3}
            </h4>
          </div>
        </section>
      )}
        <div className="projects__grid">
          <div className="project">
            <h3>EasyASL</h3>
            <h4 className="project__description">
              Hackathon winner accomplished within 36 hours. EasyASL provides a comprehensive tool for the hard-of-hearing community and other individuals who use American Sign Language (ASL).
            </h4>
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
            <h4 className="project__description">
            {summary1}
            </h4>
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
          <h3>IFDAA (in progress)</h3>
          <h4 className="project__description">
          </h4>
            <h3 className="alt"></h3>
            <p className="bp1"></p>
            <p className="bp2"></p>
            <p className="bp3"></p>
            {imageUrl ? <img src={imageUrl} alt="Search Result" /> : null}
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
