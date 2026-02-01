import { useEffect, useState } from 'react'

function FavoritesPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const fav = JSON.parse(localStorage.getItem('cg:favorites') || '[]')
    setItems(fav)
  }, [])

  async function downloadAll() {
    // Request presigned URLs for selected items
    const res = await fetch('/api/cart/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: items.map((i) => i.key) })
    })
    const data = await res.json()
    if (!res.ok) return alert('Failed to prepare download')

    // Open each URL in a new tab (simple approach)
    data.urls.forEach((u) => window.open(u, '_blank'))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      {items.length === 0 ? <p>No favorites yet. Browse galleries and click the heart icon.</p> : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {items.map((it) => (
              <div key={it.id} className="bg-white rounded-lg overflow-hidden shadow">
                <img src={it.thumbUrl} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <div className="font-semibold">{it.filename}</div>
                  <div className="text-sm text-gray-600">{it.ownerEmail}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="bg-primary text-white px-4 py-2 rounded" onClick={downloadAll}>Download selected</button>
            <button className="border px-4 py-2 rounded" onClick={() => { localStorage.removeItem('cg:favorites'); setItems([]) }}>Clear</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
