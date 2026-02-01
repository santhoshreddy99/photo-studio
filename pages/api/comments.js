import fs from 'fs/promises'
import path from 'path'

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'comments.json')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const photoId = req.query.photoId
    const content = await fs.readFile(COMMENTS_FILE, 'utf8').catch(() => '[]')
    const comments = JSON.parse(content || '[]')
    if (photoId) return res.status(200).json(comments.filter((c) => c.photoId === photoId))
    return res.status(200).json(comments)
  }

  if (req.method === 'POST') {
    const { photoId, author, text } = req.body || {}
    if (!photoId || !author || !text) return res.status(400).json({ error: 'Missing fields' })
    const content = await fs.readFile(COMMENTS_FILE, 'utf8').catch(() => '[]')
    const comments = JSON.parse(content || '[]')
    const comment = { id: Date.now().toString(36), photoId, author, text, createdAt: new Date().toISOString() }
    comments.push(comment)
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2))
    return res.status(201).json({ ok: true, comment })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
