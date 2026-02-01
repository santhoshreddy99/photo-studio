import '../styles/tailwind.css'
import { SessionProvider } from 'next-auth/react'
import Layout from '../components/Layout'
import { ToastProvider } from '../components/ToastContext'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ToastProvider>
    </SessionProvider>
  )
}