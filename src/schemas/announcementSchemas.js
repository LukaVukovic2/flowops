/**
 * Announcement Validation Schemas
 * Zod schemas for announcement forms
 * Requirements: 3.1, 3.4, 3.5, 12.1, 12.6
 */

import { z } from 'zod';

/**
 * Announcement creation/edit schema
 * Validates all fields for announcement form
 */
export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, 'Naslov je obavezan')
    .max(255, 'Naslov može imati najviše 255 znakova'),
  content: z
    .string()
    .min(1, 'Sadržaj je obavezan')
    .max(10000, 'Sadržaj može imati najviše 10000 znakova'),
  categoryId: z
    .union([
      z.string().uuid('Odaberite valjanu kategoriju'),
      z.literal(''),
      z.null()
    ])
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  imageUrl: z
    .union([
      z.string().url('Unesite valjani URL slike'),
      z.literal(''),
      z.null()
    ])
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val)
    .refine(
      (url) => {
        if (!url) return true; // Allow empty
        // Validate image format
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return validExtensions.some(ext => url.toLowerCase().includes(ext));
      },
      {
        message: 'Slika mora biti u formatu JPG, PNG, GIF ili WebP'
      }
    )
});

/**
 * Announcement publish schema
 */
export const announcementPublishSchema = z.object({
  isPublished: z.boolean({
    errorMap: () => ({ message: 'Odaberite valjani status objave' })
  })
});

/**
 * Category creation/edit schema
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Naziv je obavezan')
    .max(100, 'Naziv može imati najviše 100 znakova'),
  description: z
    .string()
    .max(500, 'Opis može imati najviše 500 znakova')
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Unesite valjani HEX kod boje (npr. #FF5733)')
    .optional()
    .nullable()
});

export default {
  announcementSchema,
  announcementPublishSchema,
  categorySchema
};
