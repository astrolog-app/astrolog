'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/custom/modal';
import styles from '@/components/modals/calibrationRowEditor.module.scss';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '@/components/ui/label';
import { useModal } from '@/context/modalProvider';
import ComboBox from '@/components/ui/comboBox';

enum CalibrationType {
  DARK = 'DARK',
  BIAS = 'BIAS'
}

export default function CalibrationRowEditor() {
  const { closeModal } = useModal();

  const [calibrationType, setCalibrationType] = useState<CalibrationType>(CalibrationType.DARK);

  const formSchema = z.object({
    camera: z.string().min(1, {
      message: 'You must at least select one calibration frame.'
    }),
    calibrationType: z.enum([CalibrationType.DARK, CalibrationType.BIAS], {
      errorMap: () => ({
        message: 'You must select a valid calibration type (DARK or BIAS).'
      })
    }),
    gain: z.coerce.number().min(1, {
      message: 'Gain must be at least 1.'
    }),
    subLength: z.coerce.number().optional(),
    cameraTemp: z.coerce.number().optional(),
    totalSubs: z.coerce.number().min(1, {
      message: 'Total subs must be at least 1.'
    })
  }).superRefine((data, ctx) => {
    if (data.calibrationType === CalibrationType.DARK) {
      if (data.subLength === undefined || data.subLength < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sub length must be at least 1 for BIAS calibration type',
          path: ['subLength']
        });
      }
      if (data.cameraTemp === undefined || data.cameraTemp < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Camera temperature must be at least 1 for BIAS calibration type',
          path: ['cameraTemp']
        });
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calibrationType: calibrationType
    }
  });

  function onSubmit() {
    console.log('submit');
  }

  return (
    <Modal
      title="Add Calibration Frames"
      className={styles.modal}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.row}>
            <Label className={styles.label}>Camera</Label>
            <FormField
              control={form.control}
              name="camera"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <ComboBox />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Calibration Type</Label>
            <FormField
              control={form.control}
              name="calibrationType"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        setCalibrationType(CalibrationType[value as keyof typeof CalibrationType]);
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select calibration type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DARK">DARK</SelectItem>
                        <SelectItem value="BIAS">BIAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Gain</Label>
            <FormField
              control={form.control}
              name="gain"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {calibrationType === CalibrationType.DARK && (
            <>
              <div className={styles.row}>
                <Label className={styles.label}>Sub Length</Label>
                <FormField
                  control={form.control}
                  name="subLength"
                  render={({ field }) => (
                    <FormItem className={styles.item}>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className={styles.row}>
                <Label className={styles.label}>Camera Temp.</Label>
                <FormField
                  control={form.control}
                  name="cameraTemp"
                  render={({ field }) => (
                    <FormItem className={styles.item}>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
          <div className={styles.row}>
            <Label className={styles.label}>Total Subs</Label>
            <FormField
              control={form.control}
              name="totalSubs"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.buttons}>
            <Button
              className={styles.nextButton}
              type="button"
              variant="secondary"
              onClick={() => closeModal()}
            >Cancel</Button>
            <Button className={styles.nextButton} type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
