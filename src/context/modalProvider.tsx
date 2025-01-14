'use client';

import { AnimatePresence } from 'framer-motion';
import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  // eslint-disable-next-line no-unused-vars
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

const defaultValue = {
  openModal: () => {},
  closeModal: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultValue);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const closeModal = () => {
    setModalContent(null);
  };

  const openModal = (content: React.ReactNode) => {
    if (modalContent !== null) {
      closeModal();
      setTimeout(() => {
        setModalContent(content);
      }, 200);
      return;
    }
    setModalContent(content);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AnimatePresence mode="wait">{modalContent}</AnimatePresence>
    </ModalContext.Provider>
  );
};

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a StateProvider');
  }
  return context;
}
