const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const { sendCredentialEmail } = require('../../../lib/sendgrid')
const { generateTempPassword, hashPassword } = require('../../../lib/password')

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

function validateEmail(email) {
  return typeof email === 'string' && /.+@.+\..+/.test(email)
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Prefer session-based admin auth
  const { getServerSession } = require('next-auth/next')
  const { authOptions } = require('../auth/[...nextauth]')
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    // fallback to ADMIN_SECRET header for backwards compatibility
    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret || req.headers['x-admin-secret'] !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const { email, name = '', tempPassword, sendEmail = true } = req.body || {}
  if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' })

  const plainPassword = tempPassword && tempPassword.length >= 6 ? tempPassword : generateTempPassword()
  const passwordHash = hashPassword(plainPassword)

  // Ensure data directory and users file exist
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    try {
      await fs.access(USERS_FILE)
    } catch (e) {
      await fs.writeFile(USERS_FILE, '[]')
    }

    const content = await fs.readFile(USERS_FILE, 'utf8')
    const users = JSON.parse(content || '[]')

    // Simple duplicate check
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'User already exists' })
    }

    const user = {
      id: crypto.randomBytes(8).toString('hex'),
      email,
      name,
      passwordHash,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    users.push(user)
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))

    // Send credential email (if requested)
    if (sendEmail) {
      try {
        await sendCredentialEmail({ to: email, name, tempPassword: plainPassword })
      } catch (err) {
        console.error('Failed to send credential email', err)
        return res.status(500).json({ error: 'User created but failed to send email' })
      }
    }

    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    console.error('create-user error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
