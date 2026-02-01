import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Professional photo galleries for your customers</h1>
          <p className="text-gray-600 mb-6">Upload sessions, assign galleries, and let customers view and download full-resolution photos securely.</p>
          <Link href="/admin" className="inline-block bg-primary text-white px-4 py-2 rounded-md">Go to Admin</Link>
        </div>
        <div className="text-center">
          <img src="https://via.placeholder.com/520x320?text=Photo+Studio" alt="Photo studio" className="rounded-lg shadow" />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold mb-2">Secure uploads</h3>
          <p className="text-sm text-gray-600">Direct-to-storage uploads with presigned URLs and background processing.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold mb-2">Private galleries</h3>
          <p className="text-sm text-gray-600">Each customer only sees their assigned photos with signed download links.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold mb-2">Fast delivery</h3>
          <p className="text-sm text-gray-600">Serve images via CDN for low-latency delivery across regions.</p>
        </div>
      </div>
    </div>
  )
}