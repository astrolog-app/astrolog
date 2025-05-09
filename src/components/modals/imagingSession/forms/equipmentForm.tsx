'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem, FormLabel,
  FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EquipmentComboBox } from '@/components/ui/comboBox';
import { EquipmentType } from '@/enums/equipmentType';
import { ImagingSessionEquipmentSchema } from '@/schemas/imagingSessionSchema';
import { ImagingSessionEquipment } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { UUID } from 'crypto';
import { Separator } from '@/components/ui/separator';
import { Camera, Compass, Filter, Layers, Telescope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EquipmentFormFormProps {
  prevTab: () => void,
  nextTab: () => void,
  isEdit: boolean,
  equipment: ImagingSessionEquipment | undefined,
  setEquipment: Dispatch<SetStateAction<ImagingSessionEquipment | undefined>>,
  editSession: () => void,
}

export default function EquipmentForm({ prevTab, nextTab, isEdit, equipment, setEquipment, editSession }: EquipmentFormFormProps) {
  const submitAction = useRef<"next" | "prev" | null>(null);

  const form = useForm<z.infer<typeof ImagingSessionEquipmentSchema>>({
    resolver: zodResolver(ImagingSessionEquipmentSchema),
    defaultValues: {
      camera: equipment?.camera_id,
      telescope: equipment?.telescope_id,
      flattener: equipment?.flattener_id,
      mount: equipment?.mount_id,
      filter: equipment?.filter_id,
    }
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    const values = form.getValues();
    const equipment: ImagingSessionEquipment = {
      camera_id: values.camera as UUID,
      telescope_id: values.telescope as UUID,
      flattener_id: values.flattener as UUID,
      mount_id: values.mount as UUID,
      filter_id: values.filter as UUID
    };
    setEquipment(equipment);

    if (submitAction.current === "next") {
      nextTab();
    } else if (submitAction.current === "prev") {
      prevTab();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="telescope"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[25px_1fr] items-start gap-4 space-y-0">
                <Telescope className="h-5 w-5 text-slate-700 mt-1" />
                <div className="space-y-1.5">
                  <FormLabel className="text-base">Telescope</FormLabel>
                  <FormControl>
                    <EquipmentComboBox
                      type={EquipmentType.TELESCOPE}
                      value={field.value as UUID}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Separator className="my-2" />

          <FormField
            control={form.control}
            name="camera"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[25px_1fr] items-start gap-4 space-y-0">
                <Camera className="h-5 w-5 text-slate-700 mt-1" />
                <div className="space-y-1.5">
                  <FormLabel className="text-base">Camera</FormLabel>
                  <FormControl>
                    <EquipmentComboBox
                      type={EquipmentType.CAMERA}
                      value={field.value as UUID}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Separator className="my-2" />

          <FormField
            control={form.control}
            name="mount"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[25px_1fr] items-start gap-4 space-y-0">
                <Compass className="h-5 w-5 text-slate-700 mt-1" />
                <div className="space-y-1.5">
                  <FormLabel className="text-base">Mount</FormLabel>
                  <FormControl>
                    <EquipmentComboBox
                      type={EquipmentType.MOUNT}
                      value={field.value as UUID}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Separator className="my-2" />

          <FormField
            control={form.control}
            name="filter"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[25px_1fr] items-start gap-4 space-y-0">
                <Filter className="h-5 w-5 text-slate-700 mt-1" />
                <div className="space-y-1.5">
                  <FormLabel className="text-base">Filter</FormLabel>
                  <FormControl>
                    <EquipmentComboBox
                      type={EquipmentType.FILTER}
                      value={field.value as UUID}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Separator className="my-2" />

          <FormField
            control={form.control}
            name="flattener"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[25px_1fr] items-start gap-4 space-y-0">
                <Layers className="h-5 w-5 text-slate-700 mt-1" />
                <div className="space-y-1.5">
                  <FormLabel className="text-base">Flattener</FormLabel>
                  <FormControl>
                    <EquipmentComboBox
                      type={EquipmentType.FLATTENER}
                      value={field.value as UUID}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <ButtonBar name={isEdit ? "Save" : "Next"} onClick={() => (submitAction.current = "next")}>
          <Button
            variant='secondary'
            onClick={() => (submitAction.current = "prev")}
          >
            Prev
          </Button>
        </ButtonBar>
      </form>
    </Form>
  );
}
