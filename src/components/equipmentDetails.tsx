'use client';

import styles from './equipmentDetails.module.scss';
import { Camera, EquipmentItem, Filter, Flattener, getEquipmentType, Telescope } from '@/interfaces/equipment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EquipmentType } from '@/enums/equipmentType';

interface EquipmentDetailsProps {
  selectedItem: EquipmentItem | undefined;
}

export default function EquipmentDetails({ selectedItem }: EquipmentDetailsProps) {
  if (selectedItem === undefined) {
    return (
      <div>No Item Selected.</div>
    );
  }

  const type: EquipmentType = getEquipmentType(selectedItem);

  return (
    <ScrollArea className={styles.component}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Specification</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Brand</TableCell>
            <TableCell>{selectedItem.brand}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>{selectedItem.name}</TableCell>
          </TableRow>

          {/* Additional Rows Based on Type */}
          {type === EquipmentType.TELESCOPE && (
            <>
              <TableRow>
                <TableCell>Focal Length</TableCell>
                <TableCell>{(selectedItem as Telescope).focal_length} mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Aperture</TableCell>
                <TableCell>{(selectedItem as Telescope).aperture} mm</TableCell>
              </TableRow>
            </>
          )}
          {type === EquipmentType.CAMERA && (
            <>
              <TableRow>
                <TableCell>Chip Size</TableCell>
                <TableCell>{(selectedItem as Camera).chip_size}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Megapixel</TableCell>
                <TableCell>{(selectedItem as Camera).mega_pixel} MP</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RGB</TableCell>
                <TableCell>{(selectedItem as Camera).rgb ? "Yes" : "No"}</TableCell>
              </TableRow>
            </>
          )}
          {type === EquipmentType.FILTER && (
            <TableRow>
              <TableCell>Filter Type</TableCell>
              <TableCell>{(selectedItem as Filter).filter_type}</TableCell>
            </TableRow>
          )}
          {type === EquipmentType.FLATTENER && (
            <TableRow>
              <TableCell>Factor</TableCell>
              <TableCell>{(selectedItem as Flattener).factor}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
