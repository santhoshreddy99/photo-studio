import fs from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth/next'

const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json')

export default async function handler(req, res) {
  const { authOptions } = require('./auth/[...nextauth]')
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user?.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    try {
      const content = await fs.readFile(PHOTOS_FILE, 'utf8')
      const photos = JSON.parse(content || '[]')
      const folders = Array.from(new Set(photos.map((p) => p.folder || 'Unsorted')))
      const stats = {}
      folders.forEach((f) => {
        stats[f] = photos.filter((p) => (p.folder || 'Unsorted') === f).length
      })
      return res.status(200).json({ folders, stats })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load folders' })
    }
  }

  if (req.method === 'POST') {
    const { action, oldName, newName, photoIds, targetFolder } = req.body || {}

    try {
      const content = await fs.readFile(PHOTOS_FILE, 'utf8')
      const photos = JSON.parse(content || '[]')

      if (action === 'create') {
        if (!newName) return res.status(400).json({ error: 'Missing folder name' })
        // Just return success; folder is created when photos are moved into it
        return res.status(201).json({ ok: true, folder: newName })
      }

      if (action === 'rename') {
        if (!oldName || !newName) return res.status(400).json({ error: 'Missing folder names' })
        photos.forEach((p) => {
          if ((p.folder || 'Unsorted') === oldName) p.folder = newName
        })
        await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2))
        return res.status(200).json({ ok: true })
      }

      if (action === 'move') {
        if (!photoIds || !targetFolder) return res.status(400).json({ error: 'Missing photoIds or targetFolder' })
        photos.forEach((p) => {
          if (photoIds.includes(p.id)) p.folder = targetFolder
        })
        await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2))
        return res.status(200).json({ ok: true })
      }

      if (action === 'delete') {
        if (!oldName) return res.status(400).json({ error: 'Missing folder name' })
        // Move all photos from this folder to Unsorted
        photos.forEach((p) => {
          if ((p.folder || 'Unsorted') === oldName) p.folder = 'Unsorted'
        })
        await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2))
        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ error: 'Invalid action' })
    } catch (err) {
      console.error('folder error', err)
      return res.status(500).json({ error: 'Failed to update folders' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
