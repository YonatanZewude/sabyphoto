import { z } from 'zod'

export const bookingFormSchema = z.object({
  service_id: z.string().uuid('Välj en fototjänst.'),
  booking_date: z.string().min(1, 'Valj ett datum.'),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Valj en ledig tid.'),
  customer_name: z.string().min(2, 'Ange ditt namn.'),
  customer_phone: z.string().min(6, 'Ange telefonnummer.'),
  customer_email: z.email('Ange en giltig e-postadress.'),
  customer_message: z.string().max(500, 'Max 500 tecken.').optional().or(z.literal('')),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
