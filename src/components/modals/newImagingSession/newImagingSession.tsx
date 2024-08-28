'use client';

import styles from './newImagingSession.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import NewImagingSessionCalibration from '@/components/modals/newImagingSession/newImagingSessionCalibration';
import NewImagingSessionEquipment from '@/components/modals/newImagingSession/newImagingSessionEquipment';
import NewImagingSessionGeneral from '@/components/modals/newImagingSession/newImagingSessionGeneral';

export default function NewImagingSession({
  onClose,
}: {
  onClose: () => void;
}) {
  const tabs: React.ReactNode[] = [
    <NewImagingSessionGeneral key="general" />,
    <NewImagingSessionEquipment key="equipment" />,
    <NewImagingSessionCalibration key="calibration" />,
  ]
  const [selectedTab, setSelectedTab] = useState<React.ReactNode>(tabs[0]);

  return (
    <Modal
      onClose={onClose}
      title="Add Imaging Session"
      separator
      className={styles.modal}
    >
      {selectedTab}
      <Button type="submit">next</Button>
    </Modal>
  );
}
