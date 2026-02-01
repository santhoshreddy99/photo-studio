import { useEffect } from 'react'

export default function Lightbox({ open, src, alt, onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev && onPrev()
      if (e.key === 'ArrowRight') onNext && onNext()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, onPrev, onNext])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="max-w-[90vw] max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2">✕</button>

        {onPrev && (
          <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full">‹</button>
        )}
        {onNext && (
          <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full">›</button>
        )}

        <img src={src} alt={alt} className="max-w-full max-h-[80vh] rounded-md shadow-xl mx-auto" />
      </div>
    </div>
  )
}