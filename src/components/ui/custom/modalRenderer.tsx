'use client';

import { useModal } from '@/context/modalProvider';

export default function ModalRenderer(): React.ReactNode {
  const { modalContent} = useModal();

  return modalContent;
}
