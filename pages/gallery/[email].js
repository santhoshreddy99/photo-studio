import fs from 'fs/promises'
import path from 'path'
import { useEffect, useState } from 'react'
import Lightbox from '../../components/Lightbox'
import LazyImage from '../../components/LazyImage'
import { PhotoIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

function GalleryCard({ photo, onView, onDownload }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transform hover:-translate-y-1 transition">
      <div className="relative h-44 bg-gray-200">
        <LazyImage src={photo.variants?.thumbUrl || ''} placeholder={photo.variants?.placeholder} alt={photo.filename} className="w-full h-full" />
        <div className="absolute inset-0 flex items-end p-3">
          <div className="bg-black/40 rounded px-2 py-1 text-white text-sm">{photo.filename}</div>
        </div>
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

  useEffect(() => {
    setPhotos(initialPhotos)
  }, [initialPhotos])

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
      <h1 className="text-2xl font-semibold mb-6">Gallery for {email}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((p, idx) => (
          <GalleryCard key={p.id} photo={p} onView={() => openAtIndex(idx)} onDownload={async () => {
            try { const url = await getUrl(p.key); window.open(url, '_blank') } catch { alert('Failed to get download url') }
          }} />
        ))}
      </div>

      <Lightbox open={lightboxOpen} src={lightboxSrc} alt="photo" onClose={() => setLightboxOpen(false)} onPrev={prev} onNext={next} />
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

