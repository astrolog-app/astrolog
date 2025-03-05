import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  height: number;
  bortle: number;
};

export default function LocationsForm() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const addLocation = (location: Omit<Location, 'id'>) => {
    const newLocation = {
      ...location,
      id: crypto.randomUUID(),
    };
    setLocations([...locations, newLocation]);
  };

  const updateLocation = (
    updatedLocation: Partial<Location> & { id: string },
  ) => {
    setLocations(
      locations.map((loc) =>
        loc.id === updatedLocation.id ? { ...loc, ...updatedLocation } : loc,
      ),
    );
    setEditingLocation(null);
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((location) => location.id !== id));
  };

  const startEditing = (location: Location) => {
    setEditingLocation(location);
  };

  const cancelEditing = () => {
    setEditingLocation(null);
  };

  return (
    <>
      <div className="space-y-8">
        <Alert variant="default">
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
            onSubmit={editingLocation ? updateLocation : addLocation}
            editingLocation={editingLocation}
            onCancel={cancelEditing}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Location List</h2>
          <LocationList
            locations={locations}
            onRemoveLocation={removeLocation}
            onEditLocation={startEditing}
          />
        </div>
      </div>
    </>
  );
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  x: z.number().min(-1000).max(1000),
  y: z.number().min(-1000).max(1000),
  height: z.number().positive('Height must be positive'),
  bortle: z.number().min(1).max(9),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  onSubmit: (location: Location | (Partial<Location> & { id: string })) => void;
  editingLocation: Location | null;
  onCancel: () => void;
}

export function LocationForm({
  onSubmit,
  editingLocation,
  onCancel,
}: LocationFormProps) {
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
    if (editingLocation) {
      onSubmit({
        id: editingLocation.id,
        name: values.name,
      });
    } else {
      onSubmit(values);
    }
    form.reset();
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
  locations: Location[];
  onRemoveLocation: (id: string) => void;
  onEditLocation: (location: Location) => void;
}

export function LocationList({
  locations,
  onRemoveLocation,
  onEditLocation,
}: LocationListProps) {
  if (locations.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No locations added yet. Use the form above to add your first location.
      </Card>
    );
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
                      onClick={() => onRemoveLocation(location.id)}
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
