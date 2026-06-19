# SABY Photo Booking

Photography booking and gallery system built with React, Vite, Tailwind CSS, Supabase, and Clerk.

## Implemented routes

Public routes:

- `/`
- `/services`
- `/booking`
- `/contact`

Protected routes:

- `/admin`
- `/admin/services`
- `/admin/opening-hours`
- `/admin/bookings`

## Project structure

- `src/app` contains the router and providers.
- `src/components` contains reusable UI, auth, shared, and layout components.
- `src/features` contains domain logic for services, opening hours, bookings, dashboard, and admin access.
- `src/lib` contains environment helpers, Supabase wiring, class utilities, and time helpers.
- `src/pages` contains route-level page composition.
- `src/types` contains the typed Supabase contract.
- `supabase/migrations` contains the SQL schema and RLS policies.
- `supabase/functions/send-booking-emails` contains the public booking notification function.
- `supabase/functions/confirm-booking` confirms admin bookings and sends customer confirmation email through Resend.

## Environment variables

Use `.env` for shared technical keys and one `.env.<client>` file per photography brand.

Copy `.env.example` to `.env` and fill in:

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

SABY Photo is the default brand in the app.

To create a new client profile:

1. Copy your existing `.env` to `.env.<clientname>`.
2. Update `VITE_SALON_*`, `VITE_SERVICES_*`, and `VITE_CONTACT_*` in that file.
3. Run the correct Vite mode for that client.

Example:

```bash
npm run dev
npm run build
```

## Clerk setup

Create a Clerk JWT template named `supabase` with claims similar to:

```json
{
  "aud": "authenticated",
  "role": "authenticated",
  "email": "{{user.primary_email_address}}",
  "sub": "{{user.id}}"
}
```

The app uses that JWT for authenticated admin requests to Supabase while public booking remains anonymous.

## Supabase setup

1. Run the SQL migration in `supabase/migrations/20260610120000_init_booking_mvp.sql`.
2. Insert the admin Clerk user ID after the first login:

```sql
insert into public.admin_users (clerk_user_id)
values ('user_123');
```

3. Deploy the edge functions om du vill skicka bokningsmejl:

```bash
supabase functions deploy send-booking-emails
supabase functions deploy confirm-booking
```

4. Set function secrets:

```bash
supabase secrets set RESEND_API_KEY=... ADMIN_NOTIFICATION_EMAIL=... SALON_NAME="SABY Photo" EMAIL_FROM_NAME="SABY Photo" EMAIL_FROM_ADDRESS="bokning@din-domän.se"
```

`SALON_NAME`, `EMAIL_FROM_NAME` och `EMAIL_FROM_ADDRESS` styr företagsspecifik branding i bokningsmejlen.

`RESEND_API_KEY` är en server-side secret för Supabase Edge Functions. Använd aldrig `VITE_RESEND_API_KEY`, eftersom `VITE_`-variabler exponeras i frontend-bundlen.

`confirm-booking` använder Resend via Edge Function-importen `npm:resend` och anropas när admin bekräftar en bokning. Endpointen uppdaterar bokningen till `confirmed` och skickar sedan kundens bekräftelsemail.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Future-ready notes

The codebase is intentionally organized so it can later support:

- multiple employees
- multiple photographers
- Stripe payments
- SMS reminders
- customer accounts

These are not implemented in this MVP.
