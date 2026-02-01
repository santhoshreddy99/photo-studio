import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  const email = req.query.email
  if (!email) return res.status(400).json({ error: 'Missing email' })

  // Require session same as gallery page: admin may view any, customer only their own
  const { getServerSession } = require('next-auth/next')
  const { authOptions } = require('./auth/[...nextauth]')
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (session.user.role === 'customer' && session.user.email.toLowerCase() !== String(email).toLowerCase()) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json')
  try {
    const content = await fs.readFile(PHOTOS_FILE, 'utf8')
    const photos = JSON.parse(content || '[]')
    const userPhotos = photos.filter((p) => p.ownerEmail === email)

    const { presignGet } = require('../../lib/r2')
    const withUrls = await Promise.all(userPhotos.map(async (p) => {
      const thumbKey = p.variants?.thumbKey || p.key
      try {
        const url = await presignGet({ key: thumbKey, expiresIn: 300 })
        p.variants = p.variants || {}
        p.variants.thumbUrl = url
        p.variants.placeholder = p.variants?.placeholder || ''
      } catch (err) {
        p.variants = p.variants || {}
        p.variants.thumbUrl = p.variants?.thumbUrl || ''
        p.variants.placeholder = p.variants?.placeholder || ''
      }
      return p
    }))

    return res.status(200).json({ ok: true, photos: withUrls })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load photos' })
  }
}
