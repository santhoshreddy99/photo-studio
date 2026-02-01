const crypto = require('crypto')

function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~'
  const bytes = crypto.randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length]
  }
  return out
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

module.exports = { generateTempPassword, hashPassword }
