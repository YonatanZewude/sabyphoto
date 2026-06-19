import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@clerk/clerk-react'
import { CalendarDays, CheckCircle2, Clock3, Mail, Phone, RotateCcw, Trash2, UserRound } from 'lucide-react'
import { format, startOfToday } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { Field, Input, Select } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { cn } from '../../lib/cn'
import { formatTimeLabel } from '../../lib/time'
import { useSupabaseClient } from '../../lib/supabase'
import { fetchOpeningHours } from '../opening-hours/opening-hours-api'
import { fetchActiveServices } from '../services/service-api'
import {
  confirmBookingWithEmail,
  createAdminBooking,
  deleteBooking,
  fetchBookingOccupancy,
  fetchBookings,
  updateBookingStatus,
} from './booking-api'
import { getAvailableTimeSlots } from './booking-availability'
import { bookingFormSchema, type BookingFormValues } from './booking-schema'
import type { BookingWithService } from './booking-types'
import type { BookingStatus } from './booking-types'

const statuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']
const minDate = format(startOfToday(), 'yyyy-MM-dd')

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Vantar',
  confirmed: 'Bekraftad',
  completed: 'Klar',
  cancelled: 'Avbokad',
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00`))
}

export function AdminBookingsSection() {
  const supabase = useSupabaseClient()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all')
  const [bookingToDelete, setBookingToDelete] = useState<BookingWithService | null>(null)
  const adminForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service_id: '',
      booking_date: minDate,
      start_time: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_message: '',
    },
  })
  const adminServiceId = useWatch({ control: adminForm.control, name: 'service_id' })
  const adminBookingDate = useWatch({ control: adminForm.control, name: 'booking_date' })
  const adminStartTime = useWatch({ control: adminForm.control, name: 'start_time' })

  const query = useQuery({
    queryKey: ['bookings', selectedDate, selectedStatus],
    queryFn: () => fetchBookings(supabase, { date: selectedDate || undefined, status: selectedStatus }),
  })

  const servicesQuery = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => fetchActiveServices(supabase),
  })

  const openingHoursQuery = useQuery({
    queryKey: ['opening-hours', 'public'],
    queryFn: () => fetchOpeningHours(supabase),
  })

  const occupancyQuery = useQuery({
    enabled: Boolean(adminBookingDate),
    queryKey: ['booking-occupancy', adminBookingDate],
    queryFn: () => fetchBookingOccupancy(supabase, adminBookingDate),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => updateBookingStatus(supabase, id, status),
    onSuccess: async () => {
      toast.success('Bokningsstatus uppdaterad.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken({ template: 'supabase' })
      return confirmBookingWithEmail(id, token)
    },
    onSuccess: async (result) => {
      if (result.warning) {
        toast.warning('Bokningen ar bekraftad, men kunden saknar e-postadress.')
      } else {
        toast.success('Bokningen är bekräftad och e-post har skickats till kunden.')
      }
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const selectedAdminService = useMemo(
    () => servicesQuery.data?.find((service) => service.id === adminServiceId),
    [adminServiceId, servicesQuery.data],
  )

  const adminSlots = useMemo(
    () =>
      getAvailableTimeSlots({
        date: adminBookingDate,
        occupancies: occupancyQuery.data ?? [],
        openingHours: openingHoursQuery.data ?? [],
        service: selectedAdminService,
      }),
    [adminBookingDate, occupancyQuery.data, openingHoursQuery.data, selectedAdminService],
  )

  useEffect(() => {
    if (!adminSlots.some((slot) => slot.startTime === adminForm.getValues('start_time'))) {
      adminForm.setValue('start_time', '')
    }
  }, [adminForm, adminSlots])

  const createMutation = useMutation({
    mutationFn: (values: BookingFormValues) => {
      const slot = adminSlots.find((item) => item.startTime === values.start_time)
      if (!slot) {
        throw new Error('Vald tid ar inte langre tillganglig.')
      }

      return createAdminBooking(supabase, { ...values, end_time: slot.endTime, status: 'confirmed' })
    },
    onSuccess: async (_, values) => {
      toast.success('Bokningen lades in.')
      setSelectedDate(values.booking_date)
      setSelectedStatus('all')
      adminForm.reset({
        service_id: '',
        booking_date: values.booking_date,
        start_time: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_message: '',
      })
      await invalidate()
      await queryClient.invalidateQueries({ queryKey: ['booking-occupancy'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBooking(supabase, id),
    onSuccess: async () => {
      setBookingToDelete(null)
      toast.success('Bokningen raderades.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const bookings = useMemo(() => query.data ?? [], [query.data])
  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      completed: bookings.filter((booking) => booking.status === 'completed').length,
    }),
    [bookings],
  )

  return (
    <div className="space-y-6">
      <ConfirmDialog
        confirmLabel="Ja, radera"
        description={
          bookingToDelete
            ? `${bookingToDelete.customer_name} - ${formatDateLabel(bookingToDelete.booking_date)} kl ${formatTimeLabel(bookingToDelete.start_time)}.`
            : 'Bokningen tas bort.'
        }
        isLoading={deleteMutation.isPending}
        onCancel={() => setBookingToDelete(null)}
        onConfirm={() => {
          if (bookingToDelete) {
            deleteMutation.mutate(bookingToDelete.id)
          }
        }}
        open={Boolean(bookingToDelete)}
        title="Vill du radera bokningen?"
      />

      <SectionHeader
        eyebrow="Bokningar"
        title="Dagens och veckans tider"
        description="Filtrera, prioritera och uppdatera kundbokningar fran en ren arbetsvy."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Visas nu', value: stats.total, icon: CalendarDays },
          { label: 'Vantar', value: stats.pending, icon: Clock3 },
          { label: 'Bekraftade', value: stats.confirmed, icon: UserRound },
          { label: 'Klara', value: stats.completed, icon: Mail },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-900/45">{label}</p>
                <p className="mt-2 text-3xl font-bold text-ink-950">{value}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-50 text-copper-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="surface-gold flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
              <CalendarDays className="h-4 w-4" />
              Manuell bokning
            </div>
            <h2 className="mt-4 text-2xl font-bold text-ink-950">Lagg in en kundbokning</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-900/62">
              Välj fototjänst och datum så visas bara tider som är lediga enligt öppettider och befintliga bokningar.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink-950">
            Status: Bekraftad
          </div>
        </div>

        <form
          className="grid gap-5 p-5 sm:p-6"
          onSubmit={adminForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <input type="hidden" {...adminForm.register('start_time')} />

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <Field error={adminForm.formState.errors.service_id?.message} label="Fototjänst">
              <Select {...adminForm.register('service_id')}>
                <option value="">Välj fototjänst</option>
                {(servicesQuery.data ?? []).map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} / {service.duration_minutes} min / {service.price} SEK
                  </option>
                ))}
              </Select>
            </Field>
            <Field error={adminForm.formState.errors.booking_date?.message} label="Datum">
              <Input min={minDate} type="date" {...adminForm.register('booking_date')} />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink-950">Lediga tider</p>
              <p className="text-xs font-semibold text-ink-900/55">{adminSlots.length} tider</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {adminSlots.map((slot) => {
                const isSelected = slot.startTime === adminStartTime

                return (
                  <button
                    className={cn(
                      'min-h-11 rounded-2xl border px-3 text-sm font-bold tabular-nums transition focus:outline-none focus:ring-4 focus:ring-copper-600/10',
                      isSelected
                        ? 'border-copper-600 bg-copper-600 text-white shadow-card'
                        : 'border-salon-line bg-white text-ink-950 hover:border-copper-600/55 hover:bg-sand-50',
                    )}
                    key={slot.startTime}
                    onClick={() => adminForm.setValue('start_time', slot.startTime, { shouldDirty: true, shouldValidate: true })}
                    type="button"
                  >
                    {slot.label}
                  </button>
                )
              })}
            </div>
            {!adminSlots.length ? (
              <div className="rounded-3xl border border-dashed border-salon-line bg-sand-50 p-5 text-sm leading-6 text-ink-900/62">
                Välj fototjänst och datum för att se lediga tider. Fullbokade tider visas inte.
              </div>
            ) : null}
            {adminForm.formState.errors.start_time ? (
              <p className="mt-2 text-sm font-medium text-red-600">{adminForm.formState.errors.start_time.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field error={adminForm.formState.errors.customer_name?.message} label="Kundnamn">
              <Input placeholder="Anna Andersson" {...adminForm.register('customer_name')} />
            </Field>
            <Field error={adminForm.formState.errors.customer_phone?.message} label="Telefon">
              <Input placeholder="0701234567" {...adminForm.register('customer_phone')} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <Field error={adminForm.formState.errors.customer_email?.message} label="E-post">
              <Input placeholder="anna@example.com" type="email" {...adminForm.register('customer_email')} />
            </Field>
            <Field error={adminForm.formState.errors.customer_message?.message} label="Intern notering / meddelande" hint="Valfritt">
              <Input placeholder="Ex. kunden kommer 5 min tidigare" {...adminForm.register('customer_message')} />
            </Field>
          </div>

          <div className="flex flex-col gap-3 border-t border-salon-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-900/62">
              Bokningen sparas som bekraftad och syns direkt i listan.
            </p>
            <Button disabled={createMutation.isPending || !adminSlots.length} type="submit">
              {createMutation.isPending ? 'Sparar...' : 'Lagg in bokning'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <Field label="Filtrera pa datum">
            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </Field>
          <Field label="Filtrera pa status">
            <Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as BookingStatus | 'all')}>
              <option value="all">Alla statusar</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button
              className="min-h-12"
              onClick={() => {
                setSelectedDate('')
                setSelectedStatus('all')
              }}
              variant="secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Rensa
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[180px_minmax(0,1fr)_240px]">
              <div className="surface-gold flex flex-row items-center gap-3 border-b border-salon-line p-4 sm:gap-4 sm:p-5 lg:flex-col lg:items-start lg:border-b-0 lg:border-r">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-950 text-gold-300 sm:h-12 sm:w-12">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold capitalize text-ink-950">{formatDateLabel(booking.booking_date)}</p>
                  <p className="text-xl font-bold text-ink-950 sm:mt-1 sm:text-2xl">
                    {formatTimeLabel(booking.start_time)}
                  </p>
                  <p className="text-xs font-semibold text-ink-900/55">
                    till {formatTimeLabel(booking.end_time)}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-lg font-bold text-ink-950 sm:text-xl">{booking.customer_name}</h3>
                  <Badge status={booking.status}>{statusLabels[booking.status]}</Badge>
                </div>

                <p className="mt-2 text-sm font-semibold text-copper-700 sm:mt-3">
                  {booking.services?.name ?? 'Okänd fototjänst'}
                </p>

                <div className="mt-3 grid gap-2.5 text-sm text-ink-900/68 md:grid-cols-2 sm:mt-4 sm:gap-3">
                  <a className="inline-flex items-center gap-2 hover:text-ink-950" href={`tel:${booking.customer_phone}`}>
                    <Phone className="h-4 w-4 text-copper-700" />
                    {booking.customer_phone}
                  </a>
                  <a className="inline-flex items-center gap-2 hover:text-ink-950" href={`mailto:${booking.customer_email}`}>
                    <Mail className="h-4 w-4 text-copper-700" />
                    {booking.customer_email}
                  </a>
                </div>

                {booking.customer_message ? (
                  <div className="mt-3 rounded-2xl bg-sand-50 px-3 py-2.5 text-sm leading-5 text-ink-900/68 sm:mt-4 sm:p-4 sm:leading-6">
                    <span className="font-bold text-ink-950">Meddelande: </span>
                    {booking.customer_message}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-between gap-3 border-t border-salon-line bg-white p-4 sm:p-5 lg:border-l lg:border-t-0">
                <div className="grid gap-2 sm:block">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-900/45 sm:mb-2">Status</p>
                  <Select
                    className="w-full sm:w-auto lg:w-full"
                    value={booking.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as BookingStatus

                      if (nextStatus === 'confirmed') {
                        confirmMutation.mutate(booking.id)
                        return
                      }

                      updateMutation.mutate({ id: booking.id, status: nextStatus })
                    }}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                {booking.status !== 'confirmed' ? (
                  <Button
                    className="min-h-11 w-full text-sm"
                    disabled={confirmMutation.isPending}
                    onClick={() => confirmMutation.mutate(booking.id)}
                    type="button"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {confirmMutation.isPending ? 'Bekraftar...' : 'Bekrafta bokning'}
                  </Button>
                ) : null}
                <Button
                  className={cn('min-h-11 w-full text-sm', deleteMutation.isPending ? 'opacity-70' : null)}
                  disabled={deleteMutation.isPending}
                  onClick={() => setBookingToDelete(booking)}
                  variant="danger"
                >
                  <Trash2 className="h-4 w-4" />
                  Radera
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {query.isLoading ? (
          <Card className="p-6 text-sm text-ink-900/65">Hamtar bokningar...</Card>
        ) : null}

        {!bookings.length && !query.isLoading ? (
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sand-50 text-copper-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink-950">Inga bokningar hittades</h3>
            <p className="mt-2 text-sm text-ink-900/62">Andra filter eller vanta tills nya kunder bokar tid.</p>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
