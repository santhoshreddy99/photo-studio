import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    // Admin provider (kept as default 'credentials' id so admin login page continues to work)
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
          return { id: 'admin', name: 'Studio Admin', email: adminEmail, role: 'admin' }
        }
        return null
      }
    }),

    // Customer credentials provider (id: 'customer')
    CredentialsProvider({
      id: 'customer',
      name: 'Customer',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) return null
        const fs = require('fs').promises
        const path = require('path')
        const { hashPassword } = require('../../../lib/password')
        const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')
        try {
          const content = await fs.readFile(USERS_FILE, 'utf8')
          const users = JSON.parse(content || '[]')
          const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase())
          if (!user || !user.isActive) return null
          const hash = hashPassword(credentials.password)
          if (hash === user.passwordHash) {
            return { id: user.id, name: user.name || user.email, email: user.email, role: 'customer' }
          }
          return null
        } catch (err) {
          console.error('customer authorize error', err)
          return null
        }
      }
    })
  ],

  session: { strategy: 'jwt' },
  jwt: { /* default settings */ },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role || token.role
      return token
    },
    async session({ session, token }) {
      session.user = session.user || {}
      session.user.role = token.role
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)

