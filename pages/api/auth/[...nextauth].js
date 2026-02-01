import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminEmail || !adminPassword) {
          throw new Error('Admin credentials not configured')
        }
        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return { id: 'admin', name: 'Studio Admin', email: adminEmail }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  jwt: { /* default settings */ },
  pages: {
    signIn: '/admin/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)

