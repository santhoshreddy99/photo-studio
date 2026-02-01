const sgMail = require('@sendgrid/mail')

// In development, make SendGrid a no-op to allow local preview without real keys.
const isDev = process.env.NODE_ENV !== 'production'
if (!process.env.SENDGRID_API_KEY) {
  if (isDev) {
    console.warn('SENDGRID_API_KEY not set — sendCredentialEmail will log instead of sending (dev mode).')
  } else {
    throw new Error('Missing SENDGRID_API_KEY in environment')
  }
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

async function sendCredentialEmail({ to, name = 'Customer', tempPassword, appUrl = process.env.APP_URL || 'http://localhost:3000' }) {
  if (!to || !tempPassword) throw new Error('Missing `to` or `tempPassword`')

  const from = process.env.SENDGRID_SENDER || 'no-reply@example.com'
  const subject = 'Your Photo Studio Account'

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.4">
      <p>Hi ${name},</p>
      <p>Your account has been created for the Photo Studio gallery. Use the temporary password below to login, then change it.</p>
      <table style="background:#f9f9f9;padding:12px;border-radius:6px">
        <tr><td><strong>Email:</strong></td><td>${to}</td></tr>
        <tr><td><strong>Temporary password:</strong></td><td>${tempPassword}</td></tr>
      </table>
      <p style="margin-top:12px"><a href="${appUrl}/login" style="background:#2563eb;color:#fff;padding:8px 12px;border-radius:4px;text-decoration:none">Login to your gallery</a></p>
      <p style="color:#666;font-size:13px">If you did not expect this, please contact the studio.</p>
      <p style="margin-top:18px">— Photo Studio</p>
    </div>
  `

  const text = `Hi ${name}\n\nYour temporary password: ${tempPassword}\n\nLogin: ${appUrl}/login\n\nIf you did not expect this, please contact the studio.`

  if (!process.env.SENDGRID_API_KEY && isDev) {
    // Log the message instead of sending in dev
    console.log('DEV sendCredentialEmail →', { to, from, subject, text })
    return Promise.resolve()
  }

  return sgMail.send({ to, from, subject, html, text })
}

module.exports = { sendCredentialEmail }
