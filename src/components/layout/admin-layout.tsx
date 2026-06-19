import { CalendarDays, Camera, Clock3, Home, Image, LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import { SignOutButton, UserButton } from '@clerk/clerk-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/cn'
import { env } from '../../lib/env'

const links = [
  { to: '/admin', label: 'Oversikt', icon: LayoutDashboard, end: true },
  { to: '/admin/services', label: 'Fototjänster', icon: Camera },
  { to: '/admin/opening-hours', label: 'Oppettider', icon: Clock3 },
  { to: '/admin/bookings', label: 'Bokningar', icon: CalendarDays },
  { to: '/admin/gallery', label: 'Galleri', icon: Image },
]

const publicLinks = [
  { to: '/', label: 'Hem', icon: Home, end: true },
  { to: '/services', label: 'Fototjänster' },
  { to: '/gallery', label: 'Galleri' },
  { to: '/contact', label: 'Kontakt' },
]

export function AdminLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-ink-950 text-white shadow-[0_30px_90px_rgba(17,17,17,0.2)]">
        <div className="surface-dark px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/20 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-gold-300">
                <Sparkles className="h-3.5 w-3.5" />
                Adminpanel
              </div>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                Hantera {env.salonName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                En samlad arbetsyta för bokningar, fototjänster, öppettider och galleri.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-3xl border border-white/10 bg-white/8 p-3 sm:w-auto sm:min-w-72">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-white/15 bg-white p-1.5">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/42">Inloggad</p>
                    <p className="text-sm font-semibold text-white">SABY Photo admin</p>
                  </div>
                </div>
                <SignOutButton>
                  <Button className="rounded-2xl bg-white/10 text-white hover:bg-white/18" variant="ghost">
                    <LogOut className="h-4 w-4" />
                    Logga ut
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <nav className="flex flex-wrap items-center gap-2">
              {publicLinks.map(({ icon: Icon, ...link }) => (
                <NavLink
                  key={link.to}
                  end={link.end}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition',
                      isActive
                        ? 'bg-white text-ink-950'
                        : 'bg-white/8 text-white/74 hover:bg-white/14 hover:text-white',
                    )
                  }
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/admin"
                className="inline-flex min-h-10 items-center justify-center rounded-full px-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-300"
              >
                Admin
              </NavLink>
              <NavLink
                to="/booking"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-gold-500 bg-gold-400 px-5 text-sm font-bold text-ink-950 transition hover:bg-gold-500"
              >
                Boka foto
              </NavLink>
            </nav>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-[28px] border border-salon-line bg-white/86 shadow-[0_22px_54px_rgba(17,17,17,0.08)] backdrop-blur">
            <div className="border-b border-salon-line bg-sand-50/80 px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-copper-700">Meny</p>
              <p className="mt-1 text-sm text-ink-900/58">Snabb navigation</p>
            </div>
            <nav className="grid gap-1 p-2">
              {links.map(({ icon: Icon, ...link }) => (
                <NavLink
                  key={link.to}
                  end={link.end}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-sm font-bold transition',
                      isActive
                        ? 'border-copper-600 bg-copper-600 text-white shadow-[0_16px_32px_rgba(185,145,29,0.24)]'
                        : 'border-transparent text-ink-900/70 hover:border-salon-line hover:bg-sand-50 hover:text-ink-950',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 pb-12">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
