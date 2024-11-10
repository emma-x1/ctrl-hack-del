'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter(); // initialize Next.js router for navigation

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Redirect to the scanner page
  const redirectToScanner = () => {
    router.push("/scanner");
  };

  useEffect(() => {
    // Handler function for keydown event
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        redirectToScanner();
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-ls">
      <div className="flex items-center w-full justify-end">
        <button onClick={toggleModal}>
          <Image 
            src="/info.svg" 
            alt="Info icon" 
            width={32} 
            height={32} 
            className="dark:invert"
          />
        </button>
        
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          <p>
            Here is some informative text about the item or topic you want to share.
            This modal can be customized with more content, images, or links as needed.
          </p>
        </Modal>
      </div>

      <main className="flex flex-col row-start-2 items-center sm:items-center mb-2">
        <Image
          src="/ecoswitch.svg" 
          alt="Next.js logo"
          width={450}
          height={45}
          priority
        />
        <div className="font-ls text-center">
          <b>click enter to get started.</b>
        </div>
      </main>


      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-2"
          href="https://devpost.com/software/ecoswitch"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            className="dark:invert"
            src="/devpost.svg"
            alt="Devpost icon"
            width={16}
            height={16}
          />
          Devpost
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/emma-x1/ctrl-hack-del"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            className="dark:invert" 
            src="/github.svg"
            alt="GitHub icon"
            width={16}
            height={16}
          />
          Github
        </a>
      </footer>
    </div>
  );
}
