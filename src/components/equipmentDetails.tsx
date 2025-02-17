'use client';

import styles from './equipmentDetails.module.scss';
import { Camera, EquipmentItem, Filter, Flattener, getEquipmentType, Telescope } from '@/interfaces/equipment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EquipmentType } from '@/enums/equipmentType';
import { getViewName } from '@/utils/equipment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
      <div className={styles.title}>
        {getViewName(selectedItem)}
      </div>
      <Tabs defaultValue="specs">
        <TabsList>
          <TabsTrigger value="specs">Detailed Specs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="specs">
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
        </TabsContent>
        <TabsContent value="analytics">Analytics</TabsContent>
      </Tabs>
      <div>
        <div>Images taken with this {type}</div>
        <div>Gallery</div>
      </div>
    </ScrollArea>
  );
}
