import * as z from 'zod';

export const baseImagingSessionSchema = z.object({
  frames: z.array(z.string()).min(1, {
    message: 'You must at least select one light frame.',
  }),
});

export const generalImagingSessionSchema = z.object({
  date: z.coerce.date({
    required_error: 'Acquisition date must be set.'
  }),
  target: z.string().min(2, {
    message: 'Target must be set.'
  })
});

export const detailsImagingSessionSchema = z.object({
  total_subs: z.number().int().positive("Total subs must be a positive integer"),
  gain: z.number().nonnegative("Gain must be a non-negative number"),
  sub_length: z.number().positive("Sub length must be a positive number"),
  notes: z.string().optional(),
  integrated_subs: z.number().int().positive("Integrated subs must be a positive integer").optional(),
  offset: z.number().optional(),
  camera_temp: z.number().optional(),
})

export const equipmentImagingSessionSchema = z.object({
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
