'use client';

import styles from './equipmentListView.module.scss';
import { Dispatch, SetStateAction, useState } from 'react';
import { useAppState } from '@/context/stateProvider';
import { EquipmentItem } from '@/interfaces/equipment';
import { getViewName } from '@/utils/equipment';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModal } from '@/context/modalProvider';
import EquipmentModal from '@/components/modals/equipment/equipment';
import { EquipmentType } from '@/enums/equipmentType';

interface EquipmentListViewProps {
  selectedItem: EquipmentItem | undefined;
  setSelectedItem: Dispatch<SetStateAction<EquipmentItem | undefined>>;
}

export default function EquipmentListView({ selectedItem, setSelectedItem }: EquipmentListViewProps) {
  const { appState } = useAppState();
  const { openModal } = useModal();

  interface Tab {
    type: EquipmentType;
    content: EquipmentItem[];
  }

  const tabs: Tab[] = [
    { type: EquipmentType.TELESCOPE, content: appState.equipment_list.telescope_list },
    { type: EquipmentType.CAMERA, content: appState.equipment_list.camera_list },
    { type: EquipmentType.MOUNT, content: appState.equipment_list.mount_list },
    { type: EquipmentType.FILTER, content: appState.equipment_list.filter_list },
    { type: EquipmentType.FLATTENER, content: appState.equipment_list.flattener_list }
  ];

  const [openItems, setOpenItems] = useState<string[]>(
    tabs.map((tab) => tab.type)
  );

  return (
    <ScrollArea className={styles.component}>
      <div className={styles.list}>
        {tabs.map((tab, index) => (
          <Accordion
            type="multiple"
            className="w-full"
            key={index}
            value={openItems}
            onValueChange={setOpenItems}
          >
            <AccordionItem value={tab.type}>
              <AccordionTrigger className="text-lg font-semibold">
                {tab.type}s ({tab.content.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="py-2">
                  {tab.content.map((item, index) => (
                    <li key={index} className="mb-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {getViewName(item)}
                      </button>
                      <button onClick={() => openModal(<EquipmentModal type={tab.type} item={item} />)}>edit</button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </ScrollArea>
  );
}
