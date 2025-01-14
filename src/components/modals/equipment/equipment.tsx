import { Modal } from '@/components/ui/custom/modal';
import { EquipmentType } from '@/enums/equipmentType';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';

const baseEquipmentSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required'),
});

const telescopeSchema = baseEquipmentSchema.extend({
  focal_length: z.number().positive('Focal length must be a positive number'),
  aperture: z.number().positive('Aperture must be a positive number'),
});

const cameraSchema = baseEquipmentSchema.extend({
  chip_size: z.string().min(1, 'Chip size is required'),
  mega_pixel: z.number().positive('Mega pixel must be a positive number'),
  rgb: z.boolean(),
});

const mountSchema = baseEquipmentSchema;

const filterSchema = baseEquipmentSchema.extend({
  filter_type: z.string().min(1, 'Filter type is required'),
});

const flattenerSchema = baseEquipmentSchema.extend({
  factor: z.number().positive('Factor must be a positive number'),
});

const equipmentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('telescope'), ...telescopeSchema.shape }),
  z.object({ type: z.literal('camera'), ...cameraSchema.shape }),
  z.object({ type: z.literal('mount'), ...mountSchema.shape }),
  z.object({ type: z.literal('filter'), ...filterSchema.shape }),
  z.object({ type: z.literal('flattener'), ...flattenerSchema.shape }),
]);

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface EquipmentProps {
  type: EquipmentType;
}

export default function EquipmentModal({ type }: EquipmentProps) {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      type: 'telescope',
      brand: '',
      name: '',
    },
  });

  const equipmentType = form.watch('type');

  function onSubmit() {}

  return (
    <Modal title={'Add ' + type}>
      <div>
        <div>Add New Equipment</div>
        <div>
          Enter the details of your new equipment here. Click save when you re
          done.
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="telescope">Telescope</SelectItem>
                    <SelectItem value="camera">Camera</SelectItem>
                    <SelectItem value="mount">Mount</SelectItem>
                    <SelectItem value="filter">Filter</SelectItem>
                    <SelectItem value="flattener">Flattener</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {equipmentType === 'telescope' && (
            <>
              <FormField
                control={form.control}
                name="focal_length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focal Length (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter focal length"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aperture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aperture (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter aperture"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {equipmentType === 'camera' && (
            <>
              <FormField
                control={form.control}
                name="chip_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chip Size</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter chip size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mega_pixel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mega Pixels</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter mega pixels"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rgb"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">RGB</FormLabel>
                      <FormDescription>Is this an RGB camera?</FormDescription>
                    </div>
                    <FormControl></FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
          {equipmentType === 'filter' && (
            <FormField
              control={form.control}
              name="filter_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter filter type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {equipmentType === 'flattener' && (
            <FormField
              control={form.control}
              name="factor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Factor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter factor"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div>
            <Button type="submit">Save Equipment</Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
