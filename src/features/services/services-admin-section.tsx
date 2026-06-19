import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, Clock3, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { SectionHeader } from '../../components/ui/section-header'
import { useSupabaseClient } from '../../lib/supabase'
import { createService, deleteService, fetchAdminServices, updateService } from './service-api'
import { ServiceForm } from './service-form'
import type { ServiceFormValues } from './service-schema'
import type { Service } from './service-types'

export function ServicesAdminSection() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  const servicesQuery = useQuery({
    queryKey: ['services', 'admin'],
    queryFn: () => fetchAdminServices(supabase),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['services'] })
  }

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => createService(supabase, values),
    onSuccess: async () => {
      toast.success('Fototjänsten skapades.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ServiceFormValues }) =>
      updateService(supabase, id, values),
    onSuccess: async () => {
      setEditingService(null)
      toast.success('Fototjänsten uppdaterades.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(supabase, id),
    onSuccess: async () => {
      setServiceToDelete(null)
      toast.success('Fototjänsten togs bort.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data])

  return (
    <div className="space-y-6">
      <ConfirmDialog
        confirmLabel="Ja, radera"
        description={
          serviceToDelete
            ? `Fototjänsten "${serviceToDelete.name}" tas bort från admin och kan inte längre bokas.`
            : 'Fototjänsten tas bort.'
        }
        isLoading={deleteMutation.isPending}
        onCancel={() => setServiceToDelete(null)}
        onConfirm={() => {
          if (serviceToDelete) {
            deleteMutation.mutate(serviceToDelete.id)
          }
        }}
        open={Boolean(serviceToDelete)}
        title="Vill du radera fototjänsten?"
      />

      <SectionHeader
        eyebrow="Fototjänster"
        title="Fotopaket"
        description="Skapa, prissätt och publicera fototjänster som kunder kan boka online."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="overflow-hidden p-0">
          <div className="surface-gold p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-950 text-gold-300">
              {editingService ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <h2 className="mt-5 text-2xl font-bold text-ink-950">
              {editingService ? 'Redigera fototjänst' : 'Ny fototjänst'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-900/62">
              Aktiva fototjänster visas direkt på bokningssidan.
            </p>
          </div>
          <div className="p-6">
            <ServiceForm
              initialValues={editingService}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onCancel={editingService ? () => setEditingService(null) : undefined}
              onSubmit={async (values) => {
                if (editingService) {
                  await updateMutation.mutateAsync({ id: editingService.id, values })
                  return
                }

                await createMutation.mutateAsync(values)
              }}
            />
          </div>
        </Card>

        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sand-50 text-copper-700">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-ink-950">{service.name}</h3>
                      <Badge status={service.is_active ? 'confirmed' : 'cancelled'}>
                        {service.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-900/68">{service.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-ink-950">
                    <span className="inline-flex items-center gap-2 rounded-full bg-sand-50 px-3 py-1.5">
                      <Clock3 className="h-4 w-4 text-copper-700" />
                      {service.duration_minutes} min
                    </span>
                    <span className="rounded-full bg-sand-50 px-3 py-1.5">{service.price} SEK</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setEditingService(service)} variant="secondary">
                    <Pencil className="h-4 w-4" />
                    Redigera
                  </Button>
                  <Button
                    disabled={deleteMutation.isPending}
                    onClick={() => setServiceToDelete(service)}
                    variant="danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    Radera
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {servicesQuery.isLoading ? <Card className="p-6 text-sm text-ink-900/65">Hamtar tjanster...</Card> : null}

          {!services.length && !servicesQuery.isLoading ? (
            <Card className="p-8 text-center text-sm text-ink-900/65">
              Inga fototjänster finns ännu. Lägg till första fotopaketet.
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
