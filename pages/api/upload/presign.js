const { getServerSession } = require('next-auth/next')
const { authOptions } = require('../auth/[...nextauth]')
const { presignUpload } = require('../../../lib/r2')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { filename, contentType, userEmail } = req.body || {}
  if (!filename || !contentType) return res.status(400).json({ error: 'Missing filename or contentType' })

  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`
  try {
    const url = await presignUpload({ key, contentType })
    return res.status(200).json({ ok: true, url, key })
  } catch (err) {
    console.error('presign error', err)
    return res.status(500).json({ error: 'Failed to create presigned URL' })
  }
}
