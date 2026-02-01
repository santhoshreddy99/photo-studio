import { presignGet } from '../../../lib/r2'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { keys } = req.body || {}
  if (!keys || !Array.isArray(keys)) return res.status(400).json({ error: 'Missing keys' })

  try {
    const urls = await Promise.all(keys.map(async (k) => {
      // demo keys with demo: prefix are public placeholders
      if (String(k).startsWith('demo:')) return `https://via.placeholder.com/1200?text=${encodeURIComponent(String(k).slice(5))}`
      const url = await presignGet({ key: String(k), expiresIn: 300 })
      return url
    }))
    return res.status(200).json({ ok: true, urls })
  } catch (err) {
    console.error('cart presign error', err)
    return res.status(500).json({ error: 'Failed to create urls' })
  }
}
