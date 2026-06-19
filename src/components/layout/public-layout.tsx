import { useEffect, useState } from 'react'
import { Camera, Menu, Sparkles, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { InstallAppButton } from '../pwa/install-app-button'
import { useAdminAccess } from '../../features/admin/use-admin-access'
import { env, isConfigured } from '../../lib/env'
import { cn } from '../../lib/cn'

const links = [
  { to: '/', label: 'Hem' },
  { to: '/services', label: 'Tjänster' },
  { to: '/gallery', label: 'Galleri' },
  { to: '/contact', label: 'Kontakt' },
]

function AdminMenuLink() {
  if (!isConfigured.clerk || !isConfigured.supabase) {
    return (
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          cn(
            'text-xs font-semibold uppercase tracking-[0.1em] transition',
            isActive
              ? 'text-copper-600'
              : 'text-ink-900/50 hover:text-copper-600',
          )
        }
      >
        Login
      </NavLink>
    )
  }

  return <AdminMenuLinkWithAccess />
}

function AdminMenuLinkWithAccess() {
  const { isLoading, isAdmin } = useAdminAccess()

  return (
    <NavLink
      to="/admin"
      className={({ isActive }) =>
        cn(
          'text-xs font-semibold uppercase tracking-[0.1em] transition',
          isActive
            ? 'text-copper-600'
            : 'text-ink-900/50 hover:text-copper-600',
        )
      }
    >
      {isLoading ? 'Login' : isAdmin ? 'ADMIN' : 'Login'}
    </NavLink>
  )
}

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-salon-line bg-white/88 shadow-[0_14px_36px_rgba(17,17,17,0.08)] backdrop-blur-xl">
        <div className="border-b border-salon-line/80 bg-ink-950 text-[10px] uppercase tracking-[0.28em] text-white/70">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8">
            <p className="truncate">{env.salonTagline}</p>
            <p className="hidden sm:block">Stockholm</p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <NavLink className="flex min-w-0 items-center gap-3" to="/">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#bd8740,#994422)] text-white shadow-[0_12px_26px_rgba(153,68,34,0.2)] sm:h-12 sm:w-12">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg leading-none text-ink-950 sm:text-2xl">{env.salonName}</p>
              <p className="hidden truncate text-xs uppercase tracking-[0.24em] text-ink-900/55 sm:block">{env.salonTagline}</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-ink-950 text-white shadow-[0_12px_24px_rgba(25,17,13,0.12)]'
                      : 'text-ink-900/70 hover:bg-white hover:text-ink-950',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <AdminMenuLink />
            <InstallAppButton />
            <Link
              to="/booking"
              className="inline-flex items-center justify-center rounded-full border border-gold-500 bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
            >
              Boka foto
            </Link>
          </nav>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Stäng menyn' : 'Öppna menyn'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-salon-line bg-white text-ink-950 transition hover:bg-sand-50 md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-salon-line bg-white/92 px-4 py-4 shadow-[0_18px_40px_rgba(17,17,17,0.08)] backdrop-blur md:hidden sm:px-6">
            <nav className="mx-auto grid w-full max-w-7xl gap-2">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'border-transparent bg-ink-950 text-white'
                        : 'border-salon-line bg-white text-ink-900/75 hover:bg-sand-50 hover:text-ink-950',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/booking"
                className="inline-flex items-center justify-center rounded-2xl border border-gold-500 bg-gold-400 px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
              >
                Boka foto
              </Link>
              <div className="rounded-2xl border border-salon-line bg-white px-4 py-3">
                <AdminMenuLink />
              </div>
              <InstallAppButton compact />
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-salon-line bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(247,235,223,0.82))]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <p className="font-serif text-3xl text-ink-950">{env.salonName}</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-ink-900/62">{env.salonName} {env.salonFooterDescription}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-600">Kontakt</p>
            <div className="mt-4 space-y-2 text-sm leading-7 text-ink-900/68">
              <p>{env.salonPhone}</p>
              <p>{env.salonEmail}</p>
              <p>{env.salonAddress}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-600">Öppettider</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-900/68">
              <Sparkles className="h-4 w-4 text-copper-600" />
              Man-Fre 10:00-18:00
            </p>
            <p className="mt-2 text-sm text-ink-900/68">Lör 10:00-15:00</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-600">Följ oss</p>
            <div className="mt-4 flex gap-3">
              {env.salonInstagramUrl && (
                <a 
                  href={env.salonInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-salon-line bg-white text-ink-900/68 transition hover:bg-ink-950 hover:text-white"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {env.salonFacebookUrl && (
                <a 
                  href={env.salonFacebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-salon-line bg-white text-ink-900/68 transition hover:bg-ink-950 hover:text-white"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {env.salonTiktokUrl && (
                <a 
                  href={env.salonTiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-salon-line bg-white text-ink-900/68 transition hover:bg-ink-950 hover:text-white"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
