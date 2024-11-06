'use client';

import styles from './EquipmentListView.module.scss';
import { Dispatch, SetStateAction } from 'react';
import { useAppState } from '@/context/stateProvider';
import { EquipmentItem } from '@/interfaces/equipment';
import { getViewName } from '@/utils/equipment';

interface EquipmentListViewProps {
  selectedItem: EquipmentItem | undefined;
  setSelectedItem: Dispatch<SetStateAction<EquipmentItem | undefined>>;
}

export default function EquipmentListView({ selectedItem, setSelectedItem }: EquipmentListViewProps) {
  const { appState } = useAppState();

  return (
    <div>
      {appState.equipment_list.telescope_list.map((t, index) => (
        <div
          key={index}
          onClick={() => {
            setSelectedItem(t);
          }}
        >
          {getViewName(t)}
        </div>
      ))}
    </div>
  );
}
