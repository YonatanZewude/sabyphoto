import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const port = Number(process.env.PORT ?? 10000)
const allowedOrigin = process.env.CORS_ORIGIN ?? '*'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const resendApiKey = process.env.RESEND_API_KEY
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
const businessName = process.env.SALON_NAME ?? process.env.BUSINESS_NAME ?? 'SABY Photo'
const emailFromName = process.env.EMAIL_FROM_NAME ?? businessName
const emailFromAddress = process.env.EMAIL_FROM_ADDRESS ?? 'onboarding@resend.dev'

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

function getUserClient(authHeader) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  })
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    ...corsHeaders,
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(body))
}

function sendNoContent(response) {
  response.writeHead(204, corsHeaders)
  response.end()
}

async function readJson(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (!chunks.length) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`)
  }

  return value.trim()
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatTime(value) {
  return String(value ?? '').slice(0, 5)
}

async function sendEmail({ to, subject, html }) {
  if (!resendApiKey || !to) {
    return { skipped: true }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${emailFromName} <${emailFromAddress}>`,
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return { sent: true }
}

function buildBookingEmail(booking, service) {
  return `
    <h1>Ny bokning hos ${escapeHtml(businessName)}</h1>
    <ul>
      <li>Namn: ${escapeHtml(booking.customer_name)}</li>
      <li>Telefon: ${escapeHtml(booking.customer_phone)}</li>
      <li>E-post: ${escapeHtml(booking.customer_email)}</li>
      <li>Fototjänst: ${escapeHtml(service?.name ?? 'Vald fototjänst')}</li>
      <li>Datum: ${escapeHtml(booking.booking_date)}</li>
      <li>Tid: ${escapeHtml(formatTime(booking.start_time))}-${escapeHtml(formatTime(booking.end_time))}</li>
      <li>Meddelande: ${escapeHtml(booking.customer_message ?? 'Inget meddelande')}</li>
    </ul>
  `
}

function buildCustomerReceivedEmail(booking, service) {
  return `
    <h1>Tack för din bokning</h1>
    <p>Hej ${escapeHtml(booking.customer_name)},</p>
    <p>Vi har tagit emot din bokning hos ${escapeHtml(businessName)}.</p>
    <ul>
      <li>Fototjänst: ${escapeHtml(service?.name ?? 'Vald fototjänst')}</li>
      <li>Datum: ${escapeHtml(booking.booking_date)}</li>
      <li>Tid: ${escapeHtml(formatTime(booking.start_time))}-${escapeHtml(formatTime(booking.end_time))}</li>
      <li>Status: Väntar på bekräftelse</li>
    </ul>
    <p>Vi kontaktar dig om något behöver justeras.</p>
  `
}

function buildCustomerConfirmedEmail(booking, service) {
  return `
    <h1>Din bokning är bekräftad</h1>
    <p>Hej ${escapeHtml(booking.customer_name)},</p>
    <p>Din bokning hos ${escapeHtml(businessName)} är bekräftad.</p>
    <ul>
      <li>Fototjänst: ${escapeHtml(service?.name ?? 'Vald fototjänst')}</li>
      <li>Datum: ${escapeHtml(booking.booking_date)}</li>
      <li>Tid: ${escapeHtml(formatTime(booking.start_time))}-${escapeHtml(formatTime(booking.end_time))}</li>
      <li>Pris: ${escapeHtml(service?.price ?? 0)} kr</li>
    </ul>
    <p>Välkommen!<br>${escapeHtml(businessName)}</p>
  `
}

async function listActiveServices(response) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) throw error
  sendJson(response, 200, data)
}

async function listActiveGallery(response) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  sendJson(response, 200, data)
}

async function listOpeningHours(response) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('opening_hours')
    .select('*')
    .order('weekday', { ascending: true })

  if (error) throw error
  sendJson(response, 200, data)
}

async function getOccupancy(response, searchParams) {
  const date = searchParams.get('date')
  if (!date) {
    sendJson(response, 400, { error: 'date is required' })
    return
  }

  const supabase = getAdminClient()
  const { data, error } = await supabase.rpc('get_booking_occupancy', { target_date: date })

  if (error) throw error
  sendJson(response, 200, data)
}

async function createBooking(response, request) {
  const body = await readJson(request)
  const booking = {
    id: randomUUID(),
    service_id: requireString(body.service_id, 'service_id'),
    booking_date: requireString(body.booking_date, 'booking_date'),
    start_time: requireString(body.start_time, 'start_time'),
    end_time: requireString(body.end_time, 'end_time'),
    customer_name: requireString(body.customer_name, 'customer_name'),
    customer_phone: requireString(body.customer_phone, 'customer_phone'),
    customer_email: requireString(body.customer_email, 'customer_email'),
    customer_message: optionalString(body.customer_message),
    status: 'pending',
  }

  const supabase = getAdminClient()
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('name, price, duration_minutes')
    .eq('id', booking.service_id)
    .maybeSingle()

  if (serviceError) throw serviceError

  const { error } = await supabase.from('bookings').insert(booking)
  if (error) throw error

  await Promise.allSettled([
    sendEmail({
      to: booking.customer_email,
      subject: `Din bokning hos ${businessName}`,
      html: buildCustomerReceivedEmail(booking, service),
    }),
    adminEmail
      ? sendEmail({
          to: adminEmail,
          subject: `Ny bokning hos ${businessName}`,
          html: buildBookingEmail(booking, service),
        })
      : Promise.resolve({ skipped: true }),
  ])

  sendJson(response, 201, { id: booking.id })
}

async function confirmBooking(response, request, bookingId) {
  const authHeader = request.headers.authorization
  if (!authHeader) {
    sendJson(response, 401, { error: 'Unauthorized' })
    return
  }

  const userClient = getUserClient(authHeader)
  const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin')
  if (adminError || !isAdmin) {
    sendJson(response, 403, { error: 'Forbidden' })
    return
  }

  const supabase = getAdminClient()
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('booking_date, customer_email, customer_name, end_time, start_time, services(name, price)')
    .eq('id', bookingId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!booking) {
    sendJson(response, 404, { error: 'Booking not found' })
    return
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)

  if (updateError) throw updateError

  if (booking.customer_email) {
    await sendEmail({
      to: booking.customer_email,
      subject: 'Din bokning är bekräftad',
      html: buildCustomerConfirmedEmail(booking, booking.services),
    })
  }

  sendJson(response, 200, { ok: true, emailSent: Boolean(booking.customer_email && resendApiKey) })
}

async function route(request, response) {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    sendNoContent(response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true, service: 'saby-photo-backend' })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/services') {
    await listActiveServices(response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/gallery') {
    await listActiveGallery(response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/opening-hours') {
    await listOpeningHours(response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/bookings/occupancy') {
    await getOccupancy(response, url.searchParams)
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/bookings') {
    await createBooking(response, request)
    return
  }

  const confirmMatch = url.pathname.match(/^\/api\/bookings\/([^/]+)\/confirm$/)
  if ((request.method === 'PATCH' || request.method === 'POST') && confirmMatch) {
    await confirmBooking(response, request, confirmMatch[1])
    return
  }

  sendJson(response, 404, { error: 'Not found' })
}

createServer((request, response) => {
  route(request, response).catch((error) => {
    console.error(error)
    sendJson(response, 500, { error: error instanceof Error ? error.message : 'Internal server error' })
  })
}).listen(port, '0.0.0.0', () => {
  console.log(`SABY Photo backend listening on port ${port}`)
})
