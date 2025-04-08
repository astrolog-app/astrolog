import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Location } from '@/interfaces/state';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import { fetchAppState, useAppState } from '@/context/stateProvider';

export default function LocationsForm() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const startEditing = (location: Location) => {
    setEditingLocation(location);
  };

  const cancelEditing = () => {
    setEditingLocation(null);
  };

  return (
    <>
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Please be aware that when sharing files from this application, your
            saved locations will also be shared. Exercise caution when
            distributing this data to protect your privacy.
          </AlertDescription>
        </Alert>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editingLocation ? 'Edit Location' : 'Add Location'}
          </h2>
          <LocationForm
            editingLocation={editingLocation}
            onCancel={cancelEditing}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Location List</h2>
          <LocationList onEditLocation={startEditing} />
        </div>
      </div>
    </>
  );
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  x: z.number().min(-180).max(180),
  y: z.number().min(-90).max(90),
  height: z.number().positive('Height must be positive'),
  bortle: z.number().min(1).max(9),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  editingLocation: Location | null;
  onCancel: () => void;
}

export function LocationForm({ editingLocation, onCancel }: LocationFormProps) {
  const { setAppState } = useAppState();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      x: 0,
      y: 0,
      height: 0,
      bortle: 1,
    },
  });

  useEffect(() => {
    if (editingLocation) {
      form.reset(editingLocation);
    } else {
      form.reset({
        name: '',
        x: 0,
        y: 0,
        height: 0,
        bortle: 1,
      });
    }
  }, [editingLocation, form]);

  const handleSubmit = (values: FormValues) => {
    const loc: Location = {
      id: (editingLocation?.id as UUID) ?? uuidv4(),
      name: values.name,
      x: values.x,
      y: values.y,
      height: values.height,
      bortle: values.bortle,
    };

    invoke('save_location', { location: loc })
      .then(() => {
        setAppState((prevState) => ({
          ...prevState,
          config: {
            ...prevState.config,
            locations: new Map(prevState.config.locations).set(loc.id, loc),
          },
        }));
        if (editingLocation) {
          fetchAppState(setAppState);
          onCancel();
        }
        form.reset();
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error,
        });
      });
  };

  const handleCancel = () => {
    onCancel();
    form.reset();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!editingLocation && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="x"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X Coordinate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="X"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>E.g. -23.638</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="y"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y Coordinate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Y"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>E.g. 32.3324</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Height"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>E.g. 426</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bortle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bortle Scale</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(Number.parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bortle scale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingLocation ? 'Update Location' : 'Add Location'}
              </Button>

              {editingLocation && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

interface LocationListProps {
  onEditLocation: (location: Location) => void;
}

export function LocationList({ onEditLocation }: LocationListProps) {
  const { appState, setAppState } = useAppState();

  const locations = Array.from(appState.config.locations.values());

  if (locations.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No locations added yet. Use the form above to add your first location.
      </Card>
    );
  }

  function deleteLocation(loc: Location) {
    invoke('delete_location', { location: loc })
      .then(() =>
        setAppState((prevState) => {
          const newLocations = new Map(prevState.config.locations);
          newLocations.delete(loc.id);

          return {
            ...prevState,
            config: {
              ...prevState.config,
              locations: newLocations,
            },
          };
        }),
      )
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error,
        });
      });
  }

  return (
    <Card>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>X</TableHead>
              <TableHead>Y</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Bortle</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.x}</TableCell>
                <TableCell>{location.y}</TableCell>
                <TableCell>{location.height}</TableCell>
                <TableCell>{location.bortle}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditLocation(location)}
                      aria-label={`Edit ${location.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLocation(location)}
                      aria-label={`Remove ${location.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
