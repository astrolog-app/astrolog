'use client';

import styles from './EquipmentListView.module.scss';
import { Dispatch, SetStateAction } from 'react';
import { useAppState } from '@/context/stateProvider';
import { EquipmentType } from '@/enums/equipmentType';

interface EquipmentListViewProps {
  selectedItem: string | undefined;
  setSelectedItem: Dispatch<SetStateAction<string | undefined>>;
  setSelectedType: Dispatch<SetStateAction<EquipmentType | undefined>>;
}

export default function EquipmentListView({ selectedItem, setSelectedItem, setSelectedType }: EquipmentListViewProps) {
  const { appState } = useAppState();

  return (
    <div>
      {appState.equipment_list.telescope_list.map((t, index) => (
        <div
          key={index}
          onClick={() => {
            setSelectedItem(t);
            setSelectedType(EquipmentType.TELESCOPE);
          }}
        >
          {t}
        </div>
      ))}
      {appState.equipment_list.camera_list.map((c, index) => (
        <div
          key={index}
          onClick={() => {
            setSelectedItem(c);
            setSelectedType(EquipmentType.CAMERA);
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
}
