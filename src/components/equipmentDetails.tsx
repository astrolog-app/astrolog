'use client';

import { useEffect, useState } from 'react';
import { Camera, Telescope } from '@/interfaces/equipment';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from '@/components/ui/use-toast';
import { EquipmentType } from '@/enums/equipmentType';

interface EquipmentDetailsProps {
  selectedItem: string | undefined;
  selectedType: EquipmentType | undefined;
}

export default function EquipmentDetails({ selectedItem, selectedType }: EquipmentDetailsProps) {
  const [telescope, setTelescope] = useState<Telescope | undefined>();
  const [camera, setCamera] = useState<Camera | undefined>();

  useEffect(() => {
    switch (selectedType) {
      case EquipmentType.TELESCOPE:
        invoke<Telescope>('get_telescope_details', { viewName: selectedItem })
          .then((t) => setTelescope(t))
          .catch((e) => toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + e
          }));
        break;
      case EquipmentType.CAMERA:
        invoke<Camera>('get_camera_details', { viewName: selectedItem })
          .then((c) => setCamera(c))
          .catch((e) => toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + e
          }));
        break;
    }
  }, [selectedItem, selectedType]);

  return (
    <div>
      {selectedItem}
      <div>{telescope?.focal_length}</div>
      <div>{camera?.chip_size}</div>
    </div>
  );
}
