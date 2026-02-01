import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  try {
    const PHOTOS_FILE = path.join(process.cwd(), 'data', 'photos.json')
    const content = await fs.readFile(PHOTOS_FILE, 'utf8')
    let photos = JSON.parse(content || '[]')
    // Return latest 12 photos
    photos = photos.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,12)
    return res.status(200).json({ ok: true, photos })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load live photos' })
  }
}
