import * as z from 'zod';

export const ImagingSessionBaseSchema = z.object({
  frames: z.array(z.string()).min(1, {
    message: 'You must at least select one light frame.',
  }),
});

export const ImagingSessionGeneralSchema = z.object({
  date: z.coerce.date({
    required_error: 'Acquisition date must be set.'
  }),
  target: z.string().min(2, {
    message: 'Target must be set.'
  }),
  location: z.string().uuid({
    message: "Location ID must be a valid UUID."
  })
});

export const ImagingSessionDetailsSchema = z.object({
  gain: z.number().nonnegative("Gain must be a non-negative number"),
  sub_length: z.number().positive("Sub length must be a positive number"),
  notes: z.string().optional(),
  offset: z.number().optional(),
  camera_temp: z.number().optional(),
})

export const ImagingSessionEquipmentSchema = z.object({
  telescope: z.string().uuid({
    message: "Telescope ID must be a valid UUID."
  }),
  camera: z.string().uuid({
    message: "Camera ID must be a valid UUID."
  }),
  mount: z.string().uuid({
    message: "Mount ID must be a valid UUID."
  }),
  filter: z.string().uuid({
    message: "Filter ID must be a valid UUID."
  }).optional(),
  flattener: z.string().uuid({
    message: "Flattener ID must be a valid UUID."
  }).optional()
});

export const ImagingSessionWeatherSchema = z.object({
  outside_temp: z.number().optional(),
  average_seeing: z.number().optional(),
  average_cloud_cover: z.number().optional(),
});

export const ImagingSessionCalibrationSchema = z.object({
  dark_frame_list_id: z.string().uuid().optional(),
  bias_frame_list_id: z.string().uuid().optional(),
  flat_frames_to_classify: z.array(z.string()),
  dark_frames_to_classify: z.array(z.string()),
});
