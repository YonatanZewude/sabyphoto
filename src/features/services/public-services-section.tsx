import { useQuery } from '@tanstack/react-query'
import { Clock3, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { env, isConfigured } from '../../lib/env'
import { getPublicSupabaseClient } from '../../lib/supabase'
import { fetchActiveServices } from './service-api'
import { mapServicesToDisplay, showcaseServices, type DisplayService } from './showcase-services'

function PublicServicesSectionContent({ services, isLoading }: { services: DisplayService[]; isLoading?: boolean }) {
  const hasServices = services.length > 0

  return (
    <div className="space-y-5 sm:space-y-8">
      <section className="surface-panel surface-hero gold-ring px-5 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div>
          <SectionHeader
            eyebrow="Fototjänster"
            title={env.servicesPageTitle}
            description={env.servicesPageDescription}
          />
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-10 w-10 rounded-2xl bg-sand-100 sm:h-12 sm:w-12" />
                <div className="min-w-0 flex-1">
                  <div className="h-6 w-2/3 rounded-full bg-sand-100" />
                  <div className="mt-3 h-4 w-24 rounded-full bg-sand-100" />
                  <div className="mt-4 h-10 rounded-3xl bg-sand-50" />
                </div>
                <div className="h-10 w-20 rounded-xl bg-sand-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="p-3.5 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand-50 text-copper-600 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="grid grid-cols-[minmax(0,1fr)_92px] items-start gap-3 sm:flex sm:flex-row sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-ink-950 sm:text-2xl">{service.name}</h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-900/62 sm:mt-2 sm:gap-3 sm:text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-50 px-2 py-0.5 font-medium text-ink-900/75 sm:gap-2 sm:px-3 sm:py-1.5">
                          <Clock3 className="h-4 w-4 text-copper-600" />
                          {service.durationLabel}
                        </span>
                        <span className="font-semibold text-ink-950 sm:text-base">{service.priceLabel}</span>
                      </div>
                    </div>
                    <Link to="/booking" className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-gold-500 bg-gold-400 px-3 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-500 sm:min-h-10 sm:px-4 sm:py-2.5">
                      Boka
                    </Link>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink-900/70 sm:mt-4 sm:line-clamp-none sm:leading-7">{service.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !hasServices ? (
        <Card className="p-6 text-sm text-ink-900/65">Inga aktiva fototjänster finns just nu. Lägg till dem i admin innan sidan publiceras.</Card>
      ) : null}

    </div>
  )
}

function PublicServicesSectionInner() {
  const supabase = getPublicSupabaseClient()
  const servicesQuery = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => fetchActiveServices(supabase),
  })

  const services = servicesQuery.data?.length ? mapServicesToDisplay(servicesQuery.data) : showcaseServices

  return <PublicServicesSectionContent isLoading={servicesQuery.isLoading} services={services} />
}

export function PublicServicesSection() {
  if (!isConfigured.supabase) {
    return <PublicServicesSectionContent services={showcaseServices} />
  }

  return <PublicServicesSectionInner />
}
