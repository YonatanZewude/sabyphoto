import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Camera, CheckCircle2, Clock3, Image, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { useSupabaseClient } from '../../lib/supabase'
import { fetchBookings } from '../bookings/booking-api'
import { fetchOpeningHours } from '../opening-hours/opening-hours-api'
import { fetchAdminServices } from '../services/service-api'

export function AdminOverview() {
  const supabase = useSupabaseClient()
  const servicesQuery = useQuery({ queryKey: ['services', 'admin'], queryFn: () => fetchAdminServices(supabase) })
  const bookingsQuery = useQuery({ queryKey: ['bookings', 'overview'], queryFn: () => fetchBookings(supabase) })
  const openingHoursQuery = useQuery({ queryKey: ['opening-hours'], queryFn: () => fetchOpeningHours(supabase) })

  const activeServices = servicesQuery.data?.filter((service) => service.is_active).length ?? 0
  const totalServices = servicesQuery.data?.length ?? 0
  const openDays = openingHoursQuery.data?.filter((row) => row.is_open).length ?? 0
  const pendingBookings = bookingsQuery.data?.filter((booking) => booking.status === 'pending').length ?? 0
  const confirmedBookings = bookingsQuery.data?.filter((booking) => booking.status === 'confirmed').length ?? 0

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Oversikt"
        title="SABY Photos drift i realtid"
        description="Se vad som kräver uppmärksamhet och hur bokningssystemet mår just nu."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Aktiva fototjänster', value: activeServices, detail: `${totalServices} totalt`, icon: Camera },
          { title: 'Oppna dagar', value: openDays, detail: 'av 7 veckodagar', icon: Clock3 },
          { title: 'Vantar svar', value: pendingBookings, detail: 'att bekrafta', icon: CalendarDays },
          { title: 'Bekraftade', value: confirmedBookings, detail: 'kommande tider', icon: CheckCircle2 },
        ].map(({ icon: Icon, title, value, detail }) => (
          <Card key={title} className="overflow-hidden p-0">
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-900/45">{title}</p>
                <p className="mt-3 text-4xl font-bold text-ink-950">{value}</p>
                <p className="mt-1 text-sm text-ink-900/58">{detail}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-50 text-copper-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden p-0">
          <div className="surface-gold p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-950 text-gold-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-ink-950">Prioritera idag</h2>
            <p className="mt-2 text-sm leading-6 text-ink-900/62">
              Börja med bokningar som väntar på bekräftelse, kontrollera dagens tider och håll fototjänsterna uppdaterade.
            </p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-3">
            {[
              'Bekrafta nya bokningar',
              'Granska öppettider',
              'Publicera starka bilder',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-salon-line bg-white p-4 text-sm font-semibold text-ink-950">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-50 text-copper-700">
            <Image className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-ink-950">Professionell front</h2>
          <p className="mt-2 text-sm leading-6 text-ink-900/62">
            Adminpanelen styr kundens upplevelse: aktiva fototjänster, synliga tider och galleri visas direkt publikt.
          </p>
        </Card>
      </div>
    </div>
  )
}
