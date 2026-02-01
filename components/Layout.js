import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Creative Graphics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white font-bold">CG</div>
            <div>
              <div className="text-lg font-semibold">Creative Graphics</div>
              <div className="text-sm text-gray-500">Client galleries & downloads</div>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-700 hover:text-primary">Admin</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">© Creative Graphics</div>
      </footer>
    </div>
  )
}
