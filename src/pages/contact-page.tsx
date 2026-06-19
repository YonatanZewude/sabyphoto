import { MapPin, Mail, Phone } from 'lucide-react'
import { Card } from '../components/ui/card'
import { PageShell } from '../components/shell/page-shell'
import { env } from '../lib/env'

export function ContactPage() {
  return (
    <PageShell className="gap-5 lg:gap-10">
      <section className="surface-panel surface-hero gold-ring px-5 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-600 sm:text-sm sm:tracking-[0.34em]">Kontakt</p>
            <h1 className="mt-2 max-w-4xl font-serif text-3xl leading-tight text-ink-950 sm:mt-3 sm:text-6xl sm:leading-none">
              {env.contactPageTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-900/72 sm:mt-4 sm:text-lg sm:leading-8">
              {env.contactPageDescription}
            </p>
          </div>

          <Card className="surface-dark overflow-hidden border-none p-4 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Direktkontakt</p>
            <div className="mt-4 space-y-2.5 text-sm leading-6 text-white/72 sm:mt-5 sm:space-y-4 sm:leading-7">
              <p>Telefon: {env.salonPhone}</p>
              <p>E-post: {env.salonEmail}</p>
              <p>Adress: {env.salonAddress}</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 sm:gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="hairline-gold p-4 sm:p-8">
          <h2 className="text-xl font-semibold text-ink-950 sm:text-2xl">Kontaktuppgifter</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-ink-900/72 sm:mt-6 sm:space-y-5">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-4 w-4 text-copper-600" />
              <div>
                <p className="font-semibold text-ink-950">Telefon</p>
                <a className="transition hover:text-copper-700" href={`tel:${env.salonPhone}`}>
                  {env.salonPhone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-copper-600" />
              <div>
                <p className="font-semibold text-ink-950">E-post</p>
                <a className="transition hover:text-copper-700" href={`mailto:${env.salonEmail}`}>
                  {env.salonEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 text-copper-600" />
              <div>
                <p className="font-semibold text-ink-950">Adress</p>
                <p>{env.salonAddress}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-sand-50 px-4 py-4 text-sm leading-6 text-ink-900/70 sm:mt-8 sm:rounded-[24px] sm:py-5 sm:leading-7">
            Tydlig information för nya kunder som vill ringa, mejla eller hitta till studion inför sin fotografering.
          </div>
        </Card>

        <Card className="overflow-hidden p-2 sm:p-3">
          <div className="overflow-hidden rounded-2xl border border-salon-line bg-sand-50 sm:rounded-[1.75rem]">
            <iframe
              className="h-[320px] w-full border-0 sm:h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={env.salonMapEmbedUrl}
              title={`Karta till ${env.salonName}`}
            />
          </div>
        </Card>
      </section>
    </PageShell>
  )
}
