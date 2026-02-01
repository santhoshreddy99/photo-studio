import Link from 'next/link'
import { PhotoIcon, ArrowDownTrayIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="bg-white rounded-2xl shadow p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-sm text-primary font-medium mb-2">Creative Graphics</div>
          <h1 className="text-4xl font-extrabold mb-4">Beautiful galleries, effortless delivery</h1>
          <p className="text-gray-600 mb-6">Create session galleries, send secure links, and let customers download full-resolution photos — all with a simple, studio-first workflow.</p>

          <div className="flex items-center gap-3">
            <Link href="/gallery/client@creativegraphics.test" className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md shadow">Preview sample gallery</Link>
            <Link href="/admin" className="inline-flex items-center border border-gray-200 px-4 py-2 rounded-md">Go to Admin</Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            <div className="flex items-start gap-3">
              <CloudArrowUpIcon className="w-6 h-6 text-primary mt-1" />
              <div>
                <div className="font-semibold">Direct uploads</div>
                <div className="text-sm text-gray-600">Presigned uploads straight to storage.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhotoIcon className="w-6 h-6 text-primary mt-1" />
              <div>
                <div className="font-semibold">Private galleries</div>
                <div className="text-sm text-gray-600">Customers see only their photos.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowDownTrayIcon className="w-6 h-6 text-primary mt-1" />
              <div>
                <div className="font-semibold">Easy downloads</div>
                <div className="text-sm text-gray-600">Signed links for secure delivery.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden shadow">
          <img src="/demo/sunset-1.svg" alt="Hero demo" className="w-full h-72 object-cover" />
        </div>
      </div>

      {/* Portfolio preview */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Recent galleries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg overflow-hidden shadow">
            <img src="/demo/sunset-1.svg" alt="Sunset" className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="font-semibold">Sunset Session</div>
              <div className="text-sm text-gray-600">10 photos — Client: client@creativegraphics.test</div>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow">
            <img src="/demo/studio-2.svg" alt="Studio" className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="font-semibold">Studio Session</div>
              <div className="text-sm text-gray-600">8 photos — Client: client@creativegraphics.test</div>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow">
            <img src="/demo/portrait-3.svg" alt="Portrait" className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="font-semibold">Portrait</div>
              <div className="text-sm text-gray-600">12 photos — Client: client@creativegraphics.test</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mt-12 bg-white rounded-lg shadow p-8 flex items-center justify-between">
        <div>
          <div className="font-semibold">Ready to create beautiful galleries?</div>
          <div className="text-sm text-gray-600">Start using Creative Graphics today to deliver a better customer experience.</div>
        </div>
        <div>
          <Link href="/admin" className="bg-primary text-white px-4 py-2 rounded-md">Get started</Link>
        </div>
      </section>
    </div>
  )
}