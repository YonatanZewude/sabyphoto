import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { InstallAppButton } from '../components/pwa/install-app-button'
import { PageShell } from '../components/shell/page-shell'
import { cn } from '../lib/cn'
import { env } from '../lib/env'
import { demoReviews } from '../features/reviews/reviews-data'

const fallbackImages = [
  {
    title: 'Modern porträttfotografering',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=85',
  },
  {
    title: 'Eventfoto med känsla',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85',
  },
  {
    title: 'Studiofotografering för varumärken',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=85',
  },
]

const curatedExperienceCards = [
  {
    title: 'Porträtt',
    subtitle: 'Professionella bilder för profil, CV och sociala medier',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Familj och par',
    subtitle: 'Varma bilder i studio, hemma eller utomhus',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Event och företag',
    subtitle: 'Dokumentation med ljus, tempo och tydlig leverans',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85',
  },
]

export function HomePage() {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0)
  const reviewsTrackRef = useRef<HTMLDivElement>(null)

  const scrollReviews = (direction: 'left' | 'right') => {
    if (!reviewsTrackRef.current) {
      return
    }

    const amount = Math.max(280, Math.round(reviewsTrackRef.current.clientWidth * 0.75))
    reviewsTrackRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  const heroSlides = useMemo(() => fallbackImages, [])

  useEffect(() => {
    setActiveHeroIndex(0)
  }, [heroSlides])

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length)
    }, 8500)

    return () => window.clearInterval(interval)
  }, [heroSlides.length])

  return (
    <PageShell className="gap-0 pt-0 sm:pt-0 lg:pt-0">
      {/* Hero Section */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <img
              key={`${slide.title}-${slide.image}`}
              alt={slide.title}
              src={slide.image}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-[center_38%] sm:object-[center_34%] lg:object-[center_30%] transition-opacity duration-[2200ms] ease-in-out',
                index === activeHeroIndex ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,162,39,0.18),transparent_42%),linear-gradient(90deg,rgba(7,7,7,0.74),rgba(7,7,7,0.46)_45%,rgba(7,7,7,0.7))]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-7xl items-end px-5 pb-10 pt-20 sm:min-h-[calc(100dvh-7rem)] sm:px-8 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-24">
          <div className="max-w-3xl space-y-4 text-white sm:space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold-300/90 sm:tracking-[0.36em]">
              Modern fotografi med personlighet
            </p>

            <h1 className="font-serif text-4xl leading-tight tracking-[0.01em] text-white sm:text-5xl sm:leading-[1.02] lg:text-7xl">
              {env.salonHeroTitle}
            </h1>

            <p className="max-w-2xl text-base leading-7 text-white/86 sm:text-xl sm:leading-relaxed">
              {env.salonHeroDescription}
            </p>

            <div className="flex flex-col items-start gap-2.5 pt-1 sm:flex-row sm:items-center sm:gap-4 sm:pt-2">
              <Link to="/booking" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-gold-500 bg-gold-400 px-5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-500 sm:px-8 sm:py-4 sm:text-base">
                Boka fotografering
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-8 sm:py-4 sm:text-base"
              >
                Se fototjänster
              </Link>
              <InstallAppButton compact />
            </div>

            <div className="flex items-center gap-3 pt-4">
              {heroSlides.map((slide, index) => (
                <button
                  key={`${slide.title}-dot`}
                  type="button"
                  onClick={() => setActiveHeroIndex(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    index === activeHeroIndex ? 'w-11 bg-gold-300' : 'w-6 bg-white/40 hover:bg-white/70',
                  )}
                  aria-label={`Visa hero-bild ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="bg-sand-50/40 py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-6 text-center sm:mb-12">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">Utvalda bilder</h2>
            <p className="mt-3 text-sm leading-6 text-ink-900/68 sm:mt-4 sm:text-lg sm:leading-relaxed">
              Admin kan dela bilder i olika kategorier så besökare enkelt ser porträtt, event, familj och företag.
            </p>
          </div>

          <div className="grid gap-3 sm:gap-6 md:grid-cols-2">
            {fallbackImages.map((item, index) => (
              <div 
                key={item.title} 
                className={`relative overflow-hidden rounded-3xl ${
                  index === 0 ? 'aspect-4/3 md:col-span-2 md:aspect-21/9' : 'aspect-4/3'
                }`}
              >
                <img alt={item.title} className="h-full w-full object-cover" src={item.image} />
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:justify-center sm:gap-4">
            <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500 bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-500 sm:px-8 sm:py-4 sm:text-base">
              Boka fotografering
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center rounded-full border border-ink-900/10 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:bg-sand-50 sm:px-8 sm:py-4 sm:text-base">
              Se fotopaket
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Services */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[linear-gradient(140deg,#07090d_0%,#0d1118_48%,#141b24_100%)] py-12 text-white sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.2),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(99,133,168,0.14),transparent_35%)]" />

        <div className="relative mx-auto flex max-w-7xl items-center px-5 sm:min-h-[72vh] sm:px-8 lg:min-h-[76vh] lg:px-12">
          <div className="grid gap-7 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div className="space-y-4 sm:space-y-6">
              <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold-300/90">
                <span className="h-px w-8 bg-gold-300/70" />
                Skräddarsytt för ditt ögonblick
              </p>
              <h2 className="font-serif text-3xl leading-tight text-white sm:text-5xl">
                Mer än en bild, en hel upplevelse
              </h2>
              <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-lg sm:leading-relaxed">
                Oavsett om du behöver porträtt, familjebilder, eventdokumentation eller visuellt material till ditt företag
                planerar vi fotograferingen efter ljus, plats och känslan du vill förmedla.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-gold-500 bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
              >
                Upptäck fototjänster
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:auto-rows-max">
              {curatedExperienceCards.map((card) => (
                <article key={card.title} className={cn("overflow-hidden rounded-2xl border border-white/12 bg-white/95 text-ink-950 shadow-[0_20px_44px_rgba(1,3,7,0.35)]")}>
                  <div className={cn("overflow-hidden", "aspect-square sm:aspect-[4/6]")}>
                    <img
                      alt={card.title}
                      src={card.image}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1.5 px-4 py-4 sm:space-y-2 sm:px-5 sm:py-5">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-sand-50 text-copper-700">
                      <Camera className="h-4 w-4" />
                    </div>
                    <h3 className="font-serif text-2xl leading-tight text-ink-950 sm:text-3xl sm:leading-[1.04]">{card.title}</h3>
                    <p className="text-sm leading-6 text-ink-900/66">{card.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-sand-50/40 py-10 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-6 sm:mb-12">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">Recensioner</h2>
          </div>

          <div className="mb-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => scrollReviews('left')}
              aria-label="Scrolla recensioner vänster"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-salon-line bg-white text-ink-900/75 transition hover:bg-ink-950 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollReviews('right')}
              aria-label="Scrolla recensioner höger"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-salon-line bg-white text-ink-900/75 transition hover:bg-ink-950 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={reviewsTrackRef}
            className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-6 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
          >
            {demoReviews.map((review) => (
              <article key={review.name} className="w-[82vw] shrink-0 snap-start rounded-2xl border border-sand-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:w-[360px] sm:p-6">
                <div className="mb-4 flex items-start gap-4">
                  <img
                    alt={review.name}
                    src={review.avatar}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-950">{review.name}</p>
                    <p className="text-xs text-ink-900/60">{review.date}</p>
                  </div>
                  <img
                    alt="Google"
                    src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-ink-900/78">"{review.quote}"</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
