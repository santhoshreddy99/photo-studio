import fs from 'fs/promises'
import path from 'path'
import { useEffect, useState } from 'react'
import Lightbox from '../../components/Lightbox'
import LazyImage from '../../components/LazyImage'
import { PhotoIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

function GalleryCard({ photo, onView, onDownload, onToggleFav }) {
  const [loading, setLoading] = useState(false)
  const isFav = typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('cg:favorites') || '[]').find((f) => f.id === photo.id))
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transform hover:-translate-y-1 transition">
      <div className="relative h-44 bg-gray-200">
        <LazyImage src={photo.variants?.thumbUrl || ''} placeholder={photo.variants?.placeholder} alt={photo.filename} className="w-full h-full" />
        <div className="absolute inset-0 flex items-end p-3">
          <div className="bg-black/40 rounded px-2 py-1 text-white text-sm">{photo.filename}</div>
        </div>
        <button onClick={() => onToggleFav(photo)} className="absolute top-3 right-3 bg-white/60 rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isFav ? 'text-red-500' : 'text-gray-700'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="text-sm text-gray-700 truncate">{photo.filename}</div>
        <div className="flex items-center gap-2">
          <button onClick={async () => { setLoading(true); await onView(photo.variants?.webpKey || photo.key); setLoading(false) }} className="text-gray-700 hover:text-primary">
            <PhotoIcon className="w-5 h-5" />
          </button>
          <button onClick={onDownload} className="text-gray-700 hover:text-primary">
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Gallery({ initialPhotos, email }) {
  const [photos, setPhotos] = useState(initialPhotos || [])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(null)

  useEffect(() => {
    setPhotos(initialPhotos)
  }, [initialPhotos])

  const folders = Array.from(new Set((photos || []).map((p) => p.folder || 'Unsorted')))


  // Poll for updated processed variants (if a photo has not been processed yet)
  useEffect(() => {
    let cancelled = false
    let attempts = 0
    async function poll() {
      attempts++
      try {
        const res = await fetch(`/api/gallery?email=${encodeURIComponent(email)}`)
        const data = await res.json()
        if (res.ok && !cancelled) {
          setPhotos(data.photos)
          const anyPending = data.photos.some((p) => !p.variants?.thumbUrl || !p.variants?.placeholder)
          if (anyPending && attempts < 30) setTimeout(poll, 4000)
        }
      } catch (err) {
        if (!cancelled && attempts < 30) setTimeout(poll, 4000)
      }
    }

    poll()
    return () => { cancelled = true }
  }, [email])

  async function getUrl(key) {
    const res = await fetch(`/api/download?key=${encodeURIComponent(key)}`)
    const data = await res.json()
    if (res.ok) return data.url
    throw new Error(data.error || 'Failed to get url')
  }

  const [currentIndex, setCurrentIndex] = useState(-1)

  async function openAtIndex(i) {
    const p = photos[i]
    if (!p) return
    try {
      const key = p.variants?.webpKey || p.key
      const url = await getUrl(key)
      setLightboxSrc(url)
      setCurrentIndex(i)
      setLightboxOpen(true)
    } catch (err) {
      alert('Failed to fetch image')
    }
  }

  async function next() {
    if (currentIndex < photos.length - 1) await openAtIndex(currentIndex + 1)
  }
  async function prev() {
    if (currentIndex > 0) await openAtIndex(currentIndex - 1)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gallery for {email}</h1>
        <div className="flex gap-3">
          <button onClick={() => window.location.href = '/favorites'} className="border px-3 py-2 rounded">Favorites</button>
          <button onClick={() => window.location.href = '/live'} className="border px-3 py-2 rounded">Live slideshow</button>
        </div>
      </div>

      {/* Folder view */}
      {!selectedFolder ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {folders.map((f) => {
            const count = photos.filter((p) => (p.folder || 'Unsorted') === f).length
            const thumb = photos.find((p) => (p.folder || 'Unsorted') === f)?.variants?.thumbUrl
            return (
              <div key={f} className="bg-white rounded-lg overflow-hidden shadow cursor-pointer" onClick={() => setSelectedFolder(f)}>
                <div className="h-48 bg-gray-100">
                  <img src={thumb || '/demo/sunset-1.svg'} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="font-semibold">{f}</div>
                  <div className="text-sm text-gray-600">{count} photos</div>
                  <div className="mt-3"><button className="text-sm text-primary">Open folder →</button></div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <button onClick={() => setSelectedFolder(null)} className="px-3 py-2 border rounded">← Back to folders</button>
            <div className="font-semibold">{selectedFolder}</div>
            <div className="text-sm text-gray-500">{photos.filter((p) => (p.folder || 'Unsorted') === selectedFolder).length} photos</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.filter((p) => (p.folder || 'Unsorted') === selectedFolder).map((p, idx) => (
              <GalleryCard key={p.id} photo={p} onView={() => openAtIndex(idx)} onDownload={async () => {
                try { const url = await getUrl(p.key); window.open(url, '_blank') } catch { alert('Failed to get download url') }
              }} onToggleFav={(photo) => {
                const fav = JSON.parse(localStorage.getItem('cg:favorites') || '[]')
                const exists = fav.find((f) => f.id === photo.id)
                const next = exists ? fav.filter((f) => f.id !== photo.id) : [...fav, { id: photo.id, filename: photo.filename, ownerEmail: photo.ownerEmail, key: photo.key, thumbUrl: photo.variants?.thumbUrl }]
                localStorage.setItem('cg:favorites', JSON.stringify(next))
              }} />
            ))}
          </div>
        </div>
      )}

      <Lightbox open={lightboxOpen} src={lightboxSrc} alt="photo" onClose={() => { setLightboxOpen(false); }} onPrev={prev} onNext={next} photoId={photos[currentIndex]?.id} />
    </div>
  )
}

export async function getServerSideProps(context) {
  const email = context.params.email

  // Require a logged-in session: admin may view any gallery; customer may only view their own
  const { getServerSession } = require('next-auth/next')
  const { authOptions } = require('../api/auth/[...nextauth]')
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return { redirect: { destination: `/login?next=/gallery/${encodeURIComponent(email)}`, permanent: false } }
  }
  if (session.user.role === 'customer' && session.user.email.toLowerCase() !== String(email).toLowerCase()) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json')
  try {
    const content = await fs.readFile(PHOTOS_FILE, 'utf8')
    const photos = JSON.parse(content || '[]')
    const userPhotos = photos.filter((p) => p.ownerEmail === email)

    // generate signed thumb urls for SSR view
    const { presignGet } = require('../../lib/r2')
    const withUrls = await Promise.all(userPhotos.map(async (p) => {
      const thumbKey = p.variants?.thumbKey || p.key
      try {
        const url = await presignGet({ key: thumbKey, expiresIn: 300 })
        p.variants = p.variants || {}
        p.variants.thumbUrl = url
        p.variants.placeholder = p.variants?.placeholder || ''
      } catch (err) {
        // demo keys may already have thumbUrl set
        p.variants = p.variants || {}
        p.variants.thumbUrl = p.variants?.thumbUrl || ''
        p.variants.placeholder = p.variants?.placeholder || ''
      }
      return p
    }))

    return { props: { initialPhotos: withUrls, email } }
  } catch (err) {
    return { props: { initialPhotos: [], email } }
  }
}

