import * as z from 'zod';

export const generalImagingSessionSchema = z.object({
  date: z.coerce.date({
    required_error: 'Acquisition date must be set.'
  }),
  target: z.string().min(2, {
    message: 'Target must be set.'
  })
});

export const equipmentImagingSessionSchema = generalImagingSessionSchema.extend({
  telescope: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  camera: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  mount: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  filter: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  flattener: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  })
});

export const imagingSessionSchema = equipmentImagingSessionSchema.extend({
  focal_length: z.number().positive('Focal length must be a positive number'),
  aperture: z.number().positive('Aperture must be a positive number')
});
