/**
 * Ticket Validation Schemas
 * Zod schemas for ticket forms
 * Requirements: 2.1, 2.10, 12.1, 12.6
 */

import { z } from 'zod';

/**
 * Ticket creation/edit schema
 * Validates all fields for ticket form
 */
export const ticketSchema = z.object({
  title: z
    .string()
    .min(1, 'Naslov je obavezan')
    .max(200, 'Naslov može imati najviše 200 znakova'),
  description: z
    .string()
    .min(1, 'Opis je obavezan')
    .max(5000, 'Opis može imati najviše 5000 znakova'),
  priority: z
    .enum(['Niska', 'Srednja', 'Visoka', 'Hitna'], {
      errorMap: () => ({ message: 'Odaberite valjani prioritet' })
    }),
  assigneeId: z
    .union([
      z.string().transform((val) => val === '' ? null : Number(val)),
      z.number(),
      z.null()
    ])
    .optional()
    .nullable(),
});

/**
 * Ticket status update schema
 */
export const ticketStatusSchema = z.object({
  status: z
    .enum(['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena'], {
      errorMap: () => ({ message: 'Odaberite valjani status' })
    })
});

/**
 * Comment schema
 */
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Komentar je obavezan')
    .max(2000, 'Komentar može imati najviše 2000 znakova')
});

export default {
  ticketSchema,
  ticketStatusSchema,
  commentSchema
};
