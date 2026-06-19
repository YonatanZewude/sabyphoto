import type { Service } from './service-types'

export type DisplayService = {
  id: string
  name: string
  description: string
  durationLabel: string
  priceLabel: string
}

export const showcaseServices: DisplayService[] = [
  {
    id: 'portrait-session',
    name: 'Porträttfotografering',
    description: 'Studio- eller utomhusporträtt för profil, CV, sociala medier och personligt varumärke.',
    durationLabel: '60 min',
    priceLabel: '1490 kr',
  },
  {
    id: 'family-session',
    name: 'Familjefotografering',
    description: 'Avslappnad fotografering för familj, barn eller par med varm och naturlig känsla.',
    durationLabel: '90 min',
    priceLabel: '2490 kr',
  },
  {
    id: 'event-coverage',
    name: 'Eventfotografering',
    description: 'Dokumentation av mingel, fest, dop, företagsevent eller särskilda ögonblick.',
    durationLabel: '120 min',
    priceLabel: '3990 kr',
  },
  {
    id: 'business-content',
    name: 'Företagsbilder',
    description: 'Professionella bilder till webb, kampanjer, personalpresentationer och sociala kanaler.',
    durationLabel: '120 min',
    priceLabel: '4990 kr',
  },
]

export function mapServicesToDisplay(services: Service[]): DisplayService[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? '',
    durationLabel: `${service.duration_minutes} min`,
    priceLabel: `${service.price} kr`,
  }))
}
