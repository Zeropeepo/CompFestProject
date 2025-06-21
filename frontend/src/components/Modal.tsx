import React from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; 
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/60 z-50 transition-opacity flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 relative w-full max-w-lg">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>
        
        {/* display */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;