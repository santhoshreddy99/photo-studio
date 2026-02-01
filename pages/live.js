import { useEffect, useState } from 'react'

export default function LivePage() {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    let mounted = true
    async function fetchLive() {
      const res = await fetch('/api/live')
      const data = await res.json()
      if (res.ok && mounted) setPhotos(data.photos)
    }
    fetchLive()
    const id = setInterval(fetchLive, 4000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Live slideshow</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((p) => (
          <div key={p.id} className="bg-white rounded-lg overflow-hidden shadow">
            <img src={p.variants?.thumbUrl || ''} className="w-full h-48 object-cover" />
            <div className="p-3">
              <div className="font-semibold">{p.filename}</div>
              <div className="text-sm text-gray-600">{p.ownerEmail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
