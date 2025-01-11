'use client';

import styles from './EquipmentListView.module.scss';
import { Dispatch, SetStateAction, useState } from 'react';
import { useAppState } from '@/context/stateProvider';
import { EquipmentItem } from '@/interfaces/equipment';
import { getViewName } from '@/utils/equipment';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EquipmentListViewProps {
  selectedItem: EquipmentItem | undefined;
  setSelectedItem: Dispatch<SetStateAction<EquipmentItem | undefined>>;
}

export default function EquipmentListView({ selectedItem, setSelectedItem }: EquipmentListViewProps) {
  const { appState } = useAppState();

  interface Tab {
    name: string,
    type: EquipmentItem[]
  }

  const tabs: Tab[] = [
    {
      name: 'Telescopes',
      type: appState.equipment_list.telescope_list
    },
    {
      name: 'Cameras',
      type: appState.equipment_list.camera_list
    },
    {
      name: 'Mounts',
      type: appState.equipment_list.mount_list
    },
    {
      name: 'Filters',
      type: appState.equipment_list.filter_list
    },
    {
      name: 'Flatteners',
      type: appState.equipment_list.flattener_list
    }
  ];

  const [openItems, setOpenItems] = useState<string[]>(tabs.map(tab => tab.name));

  return (
    <>
      {tabs.map((tab, index) => (
        <Accordion type="multiple" className="w-full" key={index} value={openItems} onValueChange={setOpenItems}>
          <AccordionItem value={tab.name}>
            <AccordionTrigger className="text-lg font-semibold">
              {tab.name} ({tab.type.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className="py-2">
                {tab.type.map((item, index) => (
                  <li key={index} className="mb-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {getViewName(item)}
                    </button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
