import { useState } from 'react'

export default function LazyImage({ src, alt, className = '', style = {}, placeholder }) {
  const [loaded, setLoaded] = useState(false)
  const bg = !loaded && placeholder ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ ...style, ...bg }}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      />
    </div>
  )
}
