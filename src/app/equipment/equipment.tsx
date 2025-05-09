'use client';

import { Tab } from '@/components/ui/custom/tab';
import { Card } from '@/components/ui/card';
import styles from './equipment.module.scss';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import { useModal } from '@/context/modalProvider';
import EquipmentModal from '@/components/modals/equipment/equipment';
import { EquipmentType } from '@/enums/equipmentType';
import EquipmentDetails from '@/components/equipment/equipmentDetails';
import EquipmentListView from '@/components/equipment/equipmentListView';
import { useState } from 'react';
import { EquipmentItem } from '@/interfaces/equipment';
import HeaderCard from '@/components/headerCard';
import { Plus } from 'lucide-react';

export default function Equipment() {
  const { openModal } = useModal();

  const [selectedItem, setSelectedItem] = useState<EquipmentItem | undefined>(
    undefined
  );

  return (
    <Tab className={styles.page}>
      <HeaderCard
        title="Equipment"
        subtitle="Manage your equipment."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            openModal(<EquipmentModal type={EquipmentType.TELESCOPE} />)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment Item
        </Button>
      </HeaderCard>
      <div className={styles.lower}>
        <Card className={styles.listView}>
          <EquipmentListView
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        </Card>
        <Card className={styles.details}>
          <EquipmentDetails selectedItem={selectedItem} />
        </Card>
      </div>
    </Tab>
  );
}
