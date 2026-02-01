const { presignGet } = require('../../lib/r2')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { key } = req.query || {}
  if (!key) return res.status(400).json({ error: 'Missing key' })

  try {
    // Demo mode: keys starting with "demo:" are returned as public URLs for preview without R2
    if (key.toString().startsWith('demo:')) {
      const name = key.toString().slice('demo:'.length)
      const publicUrl = `https://via.placeholder.com/1200?text=${encodeURIComponent(name)}`
      return res.status(200).json({ ok: true, url: publicUrl })
    }

    const url = await presignGet({ key: key.toString(), expiresIn: 300 })
    return res.status(200).json({ ok: true, url })
  } catch (err) {
    console.error('download presign error', err)
    return res.status(500).json({ error: 'Failed to create download URL' })
  }
}
