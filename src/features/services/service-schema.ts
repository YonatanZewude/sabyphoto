import { z } from 'zod'

export const serviceFormSchema = z.object({
  name: z.string().min(2, 'Ange ett namn pa tjansten.'),
  description: z.string().min(5, 'Beskriv fototjänsten kort.'),
  price: z.number().int().min(0, 'Pris maste vara 0 eller mer.'),
  duration_minutes: z.number().int().min(15, 'Minsta bokningstid är 15 minuter.').max(360, 'För lång bokningstid.'),
  is_active: z.boolean(),
})

export type ServiceFormValues = z.infer<typeof serviceFormSchema>
