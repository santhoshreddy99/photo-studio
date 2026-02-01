import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import fs from 'fs/promises'
import path from 'path'
import { processPhoto } from '../../../lib/process'

const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { key, filename, contentType, size, userEmail } = req.body || {}
  if (!key || !filename || !userEmail) return res.status(400).json({ error: 'Missing required fields' })

  try {
    await fs.mkdir(path.dirname(PHOTOS_FILE), { recursive: true })
    try {
      await fs.access(PHOTOS_FILE)
    } catch (e) {
      await fs.writeFile(PHOTOS_FILE, '[]')
    }

    const content = await fs.readFile(PHOTOS_FILE, 'utf8')
    const photos = JSON.parse(content || '[]')

    const photo = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      key,
      filename,
      contentType,
      size,
      ownerEmail: userEmail,
      createdAt: new Date().toISOString(),
      variants: {}
    }

    photos.push(photo)
    await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2))

    // Enqueue processing job to run asynchronously (worker will pick up and update the photo record)
    try {
      const { addProcessJob } = require('../../../lib/queue')
      await addProcessJob(photo)
    } catch (err) {
      console.error('enqueue failed', err)
    }

    return res.status(201).json({ ok: true, photo })
  } catch (err) {
    console.error('complete-upload error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
