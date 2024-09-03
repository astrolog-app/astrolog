'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

const defaultValue = {
  openModal: () => {},
  closeModal: () => {}
}

const ModalContext = createContext<ModalContextType>(defaultValue);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalContent}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
