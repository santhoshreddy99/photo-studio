export default function HeroVideo({ src, poster, children }) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <video className="w-full h-72 object-cover" src={src} poster={poster} autoPlay muted loop playsInline />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-2xl mx-auto text-white px-6">
          {children}
        </div>
      </div>
    </div>
  )
}
