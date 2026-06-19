import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EyeOff, Image, Send, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { SectionHeader } from '../../components/ui/section-header'
import { useSupabaseClient } from '../../lib/supabase'
import {
  createGalleryImage,
  deleteGalleryImage,
  deleteStorageImage,
  fetchAllGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from './gallery-api'

export function GalleryAdminSection() {
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()
  const [uploading, setUploading] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<{ id: string; image_url: string; title: string } | null>(null)

  const imagesQuery = useQuery({
    queryKey: ['gallery', 'admin'],
    queryFn: () => fetchAllGalleryImages(supabase),
  })

  const createMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true)
      try {
        const imageUrl = await uploadGalleryImage(supabase, file)
        const maxOrder = Math.max(0, ...(imagesQuery.data?.map((img) => img.display_order) ?? []))

        await createGalleryImage(supabase, {
          title: file.name.split('.')[0],
          image_url: imageUrl,
          display_order: maxOrder + 1,
          is_active: false,
        })
      } finally {
        setUploading(false)
      }
    },
    onSuccess: () => {
      setImageToDelete(null)
      toast.success('Bilden laddades upp som utkast.')
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Kunde inte ladda upp bilden.')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateGalleryImage(supabase, id, { is_active: !isActive }),
    onSuccess: (image) => {
      toast.success(image.is_active ? 'Bilden ar delad i galleriet.' : 'Bilden ar dold fran galleriet.')
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Kunde inte uppdatera bilden.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (image: { id: string; image_url: string }) => {
      await deleteGalleryImage(supabase, image.id)

      try {
        await deleteStorageImage(supabase, image.image_url)
      } catch (error) {
        console.error('Failed to delete storage image:', error)
      }
    },
    onSuccess: () => {
      setImageToDelete(null)
      toast.success('Bilden togs bort.')
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Kunde inte ta bort bilden.')
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Valj en bildfil.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bilden far max vara 5MB.')
      return
    }

    createMutation.mutate(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        confirmLabel="Ja, radera"
        description={
          imageToDelete
            ? `Bilden "${imageToDelete.title}" tas bort fran galleriet och lagringen.`
            : 'Bilden tas bort fran galleriet.'
        }
        isLoading={deleteMutation.isPending}
        onCancel={() => setImageToDelete(null)}
        onConfirm={() => {
          if (imageToDelete) {
            deleteMutation.mutate({
              id: imageToDelete.id,
              image_url: imageToDelete.image_url,
            })
          }
        }}
        open={Boolean(imageToDelete)}
        title="Vill du ta bort bilden?"
      />

      <SectionHeader
        eyebrow="Galleri"
        title="Bildbibliotek"
        description="Ladda upp, förhandsgranska och publicera bilder. Skriv gärna kategori i titeln, till exempel Porträtt, Event eller Familj."
      />

      <Card className="overflow-hidden p-0">
        <div className="surface-gold flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
              <Image className="h-4 w-4" />
              SABY Photo media
            </div>
            <h2 className="mt-4 text-2xl font-bold text-ink-950">Publicera ett modernt fotogalleri</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-900/62">
              Nya bilder sparas som utkast. Klicka Dela när bilden ska visas för kunder på den publika gallerisidan.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label htmlFor="upload-image" className="cursor-pointer">
              <div className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper-600 px-5 text-sm font-bold text-white transition hover:bg-copper-700">
                <Upload className="h-5 w-5" />
                {uploading ? 'Laddar upp...' : 'Ladda upp bild'}
              </div>
              <input
                accept="image/*"
                className="hidden"
                disabled={uploading}
                id="upload-image"
                onChange={handleFileUpload}
                type="file"
              />
            </label>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-salon-line bg-white px-5 text-sm font-bold text-ink-950 transition hover:bg-sand-50"
              to="/gallery"
            >
              Visa publikt
            </Link>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {imagesQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-4/3 animate-pulse rounded-3xl bg-sand-100" />
              ))}
            </div>
          ) : null}

          {imagesQuery.data && imagesQuery.data.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-ink-900/10 py-14 text-center">
              <Image className="mx-auto h-12 w-12 text-ink-900/20" />
              <h3 className="mt-4 text-lg font-bold text-ink-950">Inga bilder uppladdade</h3>
              <p className="mt-2 text-sm text-ink-900/62">Ladda upp första bilden för att bygga galleriet.</p>
            </div>
          ) : null}

          {imagesQuery.data && imagesQuery.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagesQuery.data.map((image) => (
                <article key={image.id} className="overflow-hidden rounded-3xl border border-salon-line bg-white shadow-sm">
                  <div className="relative aspect-4/3">
                    <img
                      alt={image.title}
                      className="h-full w-full object-cover"
                      src={image.image_url}
                    />
                    <div className="absolute left-3 top-3">
                      <Badge status={image.is_active ? 'confirmed' : 'pending'}>
                        {image.is_active ? 'Delad' : 'Utkast'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <h3 className="line-clamp-1 text-base font-bold text-ink-950">{image.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-ink-900/58">
                        {image.is_active
                          ? 'Syns pa den publika gallerisidan.'
                          : 'Syns inte publikt forran du delar den.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="flex-1"
                        disabled={toggleActiveMutation.isPending}
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: image.id,
                            isActive: image.is_active,
                          })
                        }
                        variant={image.is_active ? 'secondary' : 'primary'}
                      >
                        {image.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Dolj
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Dela
                          </>
                        )}
                      </Button>

                      <Button
                        aria-label={`Ta bort ${image.title}`}
                        className="px-3"
                        disabled={deleteMutation.isPending}
                        onClick={() => setImageToDelete(image)}
                        variant="danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
