const { sendCredentialEmail } = require('../../lib/sendgrid')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || req.headers['x-admin-secret'] !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { to, name, tempPassword } = req.body || {}
  if (!to || !tempPassword) return res.status(400).json({ error: 'Missing `to` or `tempPassword` in body' })

  try {
    await sendCredentialEmail({ to, name, tempPassword })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('sendCredentialEmail error', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
