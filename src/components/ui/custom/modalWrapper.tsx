'use client';

import { useModal } from '@/context/modalProvider';

export default function ModalWrapper(): React.ReactNode {
  const { modalContent} = useModal();

  return modalContent;
}
