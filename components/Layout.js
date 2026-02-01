import Head from 'next/head'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Layout({ children }) {
  const { data: session } = useSession()

  return (
    <div>
      <Head>
        <title>Creative Graphics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
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
            {!session && (
              <button onClick={() => signIn('customer')} className="text-sm text-gray-700 hover:text-primary">Customer Login</button>
            )}
            {session && session.user?.role === 'customer' && (
              <div className="flex items-center gap-3">
                <Link href={`/gallery/${encodeURIComponent(session.user.email)}`} className="text-sm text-gray-700 hover:text-primary">My Gallery</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-gray-700 hover:text-primary">Sign out</button>
              </div>
            )}
            {session && session.user?.role === 'admin' && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700">Signed in as <strong>{session.user.email}</strong></div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-gray-700 hover:text-primary">Sign out</button>
              </div>
            )}
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
