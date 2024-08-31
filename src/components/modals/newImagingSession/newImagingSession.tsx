'use client';

import styles from './newImagingSession.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import React, { useState } from 'react';
import NewImagingSessionCalibration from '@/components/modals/newImagingSession/newImagingSessionCalibration';
import NewImagingSessionEquipment from '@/components/modals/newImagingSession/newImagingSessionEquipment';
import NewImagingSessionGeneral from '@/components/modals/newImagingSession/newImagingSessionGeneral';

const tabKeys = ['general', 'equipment', 'calibration'] as const;
export type TabKey = typeof tabKeys[number];

export default function NewImagingSession({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selectedTab, setSelectedTab] = useState<TabKey>('general');

  function renderTab(): React.ReactNode {
    switch (selectedTab) {
      case 'general':
        return <NewImagingSessionGeneral key="general" setSelectedTab={setSelectedTab} />;
      case 'equipment':
        return <NewImagingSessionEquipment key="equipment" />;
      case 'calibration':
        return <NewImagingSessionCalibration key="calibration" />;
      default:
        return <NewImagingSessionGeneral key="general" setSelectedTab={setSelectedTab} />;
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Add Imaging Session"
      separator
      className={styles.modal}
    >
      {renderTab()}
    </Modal>
  );
}
