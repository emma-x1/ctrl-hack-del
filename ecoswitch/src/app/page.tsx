'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const redirectToScanner = () => {
    router.push("/scanner");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        redirectToScanner();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-ls">
      <div className="flex items-center w-full justify-end ">
        <button onClick={toggleModal} className="hover:underline">
          <Image 
            src="/info.svg" 
            alt="Info icon" 
            width={32} 
            height={32} 
            className="dark:invert"
          />
        </button>
        
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          <div className="modal-content">
            <p>
              Here is some informative text about the item or topic you want to share.
              This modal can be customized with more content, images, or links as needed.
            </p>
          </div>
        </Modal>
      </div>

      {/* Main Logo and Instructions */}
      <main className="logo">
        <Image
          src="/ecoswitch.svg" 
          alt="Ecoswitch logo"
          width={450}
          height={45}
          priority
        />
        <div className="instructions">
          {/* Updated Button */}
          <button onClick={redirectToScanner} className="start-button">
            click enter to get started.
          </button>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="footer-links">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-2"
          href="https://devpost.com/software/ecoswitch"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
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
