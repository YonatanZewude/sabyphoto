import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Field, Input, Textarea } from '../../components/ui/field'
import { serviceFormSchema, type ServiceFormValues } from './service-schema'
import type { Service } from './service-types'

type ServiceFormProps = {
  initialValues?: Service | null
  isSubmitting?: boolean
  onSubmit: (values: ServiceFormValues) => Promise<void>
  onCancel?: () => void
}

export function ServiceForm({ initialValues, isSubmitting, onSubmit, onCancel }: ServiceFormProps) {
  const defaultValues = useMemo<ServiceFormValues>(
    () => ({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      price: initialValues?.price ?? 0,
      duration_minutes: initialValues?.duration_minutes ?? 60,
      is_active: initialValues?.is_active ?? true,
    }),
    [initialValues],
  )

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [form, initialValues, defaultValues])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values)

    if (!initialValues) {
      form.reset({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 60,
        is_active: true,
      })
    }
  })

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Field error={form.formState.errors.name?.message} label="Fototjänstens namn">
        <Input placeholder="Porträttfotografering" {...form.register('name')} />
      </Field>
      <Field error={form.formState.errors.description?.message} label="Beskrivning">
        <Textarea placeholder="Beskriv vad kunden får, plats, leverans och vem fototjänsten passar för" {...form.register('description')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={form.formState.errors.price?.message} label="Pris (SEK)">
          <Input min={0} step={1} type="number" {...form.register('price', { valueAsNumber: true })} />
        </Field>
        <Field error={form.formState.errors.duration_minutes?.message} label="Tid (minuter)">
          <Input min={15} step={15} type="number" {...form.register('duration_minutes', { valueAsNumber: true })} />
        </Field>
      </div>
      <label className="flex items-center justify-between gap-4 rounded-2xl border border-salon-line bg-sand-50 px-4 py-3 text-sm font-bold text-ink-950">
        <span>Fototjänsten är aktiv och synlig för kunder</span>
        <input className="h-5 w-5 rounded border-salon-line accent-copper-600" type="checkbox" {...form.register('is_active')} />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting} type="submit">
          {initialValues ? 'Uppdatera fototjänst' : 'Lägg till fototjänst'}
        </Button>
        {onCancel ? (
          <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
            Avbryt
          </Button>
        ) : null}
      </div>
    </form>
  )
}
