'use client';
import { FC } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="font-ls, bg-[#e4e2dd] border-2 border-[#292929] rounded-lg p-6 max-w-md w-full shadow-lg relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-[#292929] hover:text-gray-700"
        >
          ✕
        </button>
        <div className="text-[#292929]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
