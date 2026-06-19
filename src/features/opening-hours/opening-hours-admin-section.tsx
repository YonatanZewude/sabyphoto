import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Coffee, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, TimeSelect } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { cn } from '../../lib/cn'
import { useSupabaseClient } from '../../lib/supabase'
import { fetchOpeningHours, saveOpeningHours } from './opening-hours-api'
import { openingHoursSchema, type OpeningHoursFormValues } from './opening-hours-schema'

const weekdayLabels = ['Sondag', 'Mandag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lordag']

export function OpeningHoursAdminSection() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['opening-hours'],
    queryFn: () => fetchOpeningHours(supabase),
  })

  const form = useForm<OpeningHoursFormValues>({
    resolver: zodResolver(openingHoursSchema),
    defaultValues: [],
  })

  useEffect(() => {
    if (query.data) {
      form.reset(query.data)
    }
  }, [form, query.data])

  const mutation = useMutation({
    mutationFn: (values: OpeningHoursFormValues) => saveOpeningHours(supabase, values),
    onSuccess: async () => {
      toast.success('Oppettiderna sparades.')
      await queryClient.invalidateQueries({ queryKey: ['opening-hours'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeader
        eyebrow="Oppettider"
        title="Veckoschema"
        description="Styr exakt vilka dagar och tider som kunder kan boka online."
      />

      <Card className="overflow-hidden p-0">
        <div className="surface-gold flex flex-col gap-3 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
              <Clock3 className="h-4 w-4" />
              Bokningsbara tider
            </div>
            <h2 className="mt-3 text-xl font-bold text-ink-950 sm:mt-4 sm:text-2xl">Justera SABY Photos vecka</h2>
            <p className="mt-1.5 text-sm leading-6 text-ink-900/62 sm:mt-2">
              Stangda dagar och lunchpauser tas automatiskt bort fran kundens lediga tider.
            </p>
          </div>
          <Button
            disabled={mutation.isPending || query.isLoading}
            form="opening-hours-form"
            type="submit"
          >
            <Save className="h-4 w-4" />
            Spara oppettider
          </Button>
        </div>

        <form
          className="grid gap-2.5 p-3 sm:gap-3 sm:p-6"
          id="opening-hours-form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          {(query.data ?? []).map((row, index) => {
            const isOpen = form.watch(`${index}.is_open`)

            return (
              <div
                key={row.id}
                className={cn(
                  'rounded-2xl border p-3.5 transition sm:rounded-3xl sm:p-5',
                  isOpen ? 'border-salon-line bg-white shadow-sm' : 'border-transparent bg-sand-50 opacity-78',
                )}
              >
                <input type="hidden" {...form.register(`${index}.id`)} />
                <input type="hidden" {...form.register(`${index}.weekday`, { valueAsNumber: true })} />
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={cn('grid h-10 w-10 place-items-center rounded-2xl sm:h-12 sm:w-12', isOpen ? 'bg-ink-950 text-gold-300' : 'bg-white text-ink-900/42')}>
                      <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink-950 sm:text-lg">{weekdayLabels[row.weekday]}</h3>
                      <p className="text-sm text-ink-900/58 sm:mt-1">
                        {isOpen ? 'Tar emot bokningar' : 'Stangd for onlinebokning'}
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex w-fit items-center gap-2.5 rounded-full border border-salon-line bg-white px-3 py-1.5 text-sm font-bold text-ink-950 sm:gap-3 sm:px-4 sm:py-2">
                    <input className="h-4 w-4 accent-copper-600 sm:h-5 sm:w-5" type="checkbox" {...form.register(`${index}.is_open`)} />
                    Oppet
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field error={form.formState.errors[index]?.start_time?.message} label="Oppnar">
                    <TimeSelect {...form.register(`${index}.start_time`)} />
                  </Field>
                  <Field error={form.formState.errors[index]?.end_time?.message} label="Stanger">
                    <TimeSelect {...form.register(`${index}.end_time`)} />
                  </Field>
                  <Field error={form.formState.errors[index]?.break_start?.message} label="Lunch start">
                    <TimeSelect {...form.register(`${index}.break_start`)} />
                  </Field>
                  <Field error={form.formState.errors[index]?.break_end?.message} label="Lunch slut">
                    <TimeSelect {...form.register(`${index}.break_end`)} />
                  </Field>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sand-50 px-2.5 py-1 text-xs font-semibold text-ink-900/58 sm:mt-4 sm:px-3 sm:py-1.5">
                  <Coffee className="h-4 w-4 text-copper-700" />
                  Lunchpaus ar valfri
                </div>
              </div>
            )
          })}

          {query.isLoading ? <div className="p-4 text-sm text-ink-900/62">Hamtar oppettider...</div> : null}
        </form>
      </Card>
    </div>
  )
}
