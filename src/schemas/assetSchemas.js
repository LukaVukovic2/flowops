/**
 * Asset Validation Schemas
 * Zod schemas for asset forms
 * Requirements: 8.1, 8.4, 12.1, 12.6
 */

import { z } from 'zod';

/**
 * Asset creation/edit schema
 * Validates all fields for asset form
 */
export const assetSchema = z.object({
  name: z
    .string()
    .min(1, 'Naziv je obavezan')
    .max(255, 'Naziv može imati najviše 255 znakova'),
  
  type: z
    .enum(['Hardware', 'Software', 'Network', 'Peripheral'], {
      required_error: 'Odaberite valjani tip',
      invalid_type_error: 'Odaberite valjani tip'
    }),
  
  status: z
    .enum(['Active', 'Inactive', 'Maintenance', 'Retired'], {
      required_error: 'Odaberite valjani status',
      invalid_type_error: 'Odaberite valjani status'
    }),
  
  serialNumber: z
    .string()
    .max(100, 'Serijski broj može imati najviše 100 znakova')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  model: z
    .string()
    .max(100, 'Model može imati najviše 100 znakova')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  manufacturer: z
    .string()
    .max(100, 'Proizvođač može imati najviše 100 znakova')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  location: z
    .string()
    .max(255, 'Lokacija može imati najviše 255 znakova')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  purchaseDate: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Nevažeći datum kupovine'),
  
  warrantyExpiry: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Nevažeći datum isteka garancije'),
  
  notes: z
    .string()
    .max(2000, 'Bilješke mogu imati najviše 2000 znakova')
    .optional()
    .nullable()
    .or(z.literal(''))
});

export default {
  assetSchema
};
