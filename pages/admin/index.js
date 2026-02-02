import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useToast } from '../../components/ToastContext'
import Link from 'next/link'

function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array).map((n) => chars[n % chars.length]).join('')
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [adminSecret, setAdminSecret] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/admin/login'
    }
  }, [status])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const body = { email, name, tempPassword: tempPassword || undefined, sendEmail }

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      toast.add(`User created: ${data.user.email}`)
      setEmail('')
      setName('')
      setTempPassword('')
    } catch (err) {
      toast.add(`Failed to create user: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div style={{ maxWidth: 720, margin: '36px auto' }}>Checking session…</div>
  }

  return (
    <div style={{ maxWidth: 720, margin: '36px auto', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin — Create Customer Account</h1>
        {session && (
          <div>
            <span style={{ marginRight: 12 }}>Signed in as <strong>{session.user.email}</strong></span>
            <button onClick={() => signOut({ callbackUrl: '/admin/login' })}>Sign out</button>
          </div>
        )}
      </header>

      <p style={{ color: '#555' }}>
        This admin page allows the studio to create customer accounts and optionally send the
        credential email. You must be signed in as an admin to use this page.
      </p>

      <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f3f4f6', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Admin Tools</h3>
        <Link href="/admin/folders" style={{ display: 'inline-block', marginTop: 8, padding: '8px 12px', backgroundColor: '#2563eb', color: 'white', borderRadius: 4, textDecoration: 'none', fontSize: 14 }}>
          📁 Manage Folders & Photos
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Customer name
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 8 }} placeholder="Jane Doe" />
        </label>

        <label>
          Customer email (assign uploads to this email)
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} placeholder="customer@example.com" type="email" required />
        </label>

        <label>
          Temporary password (leave blank to generate)
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} style={{ flex: 1, padding: 8 }} />
            <button type="button" onClick={() => setTempPassword(generateTempPassword())} style={{ padding: '8px 12px' }}>
              Generate
            </button>
          </div>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
          Send credential email to customer
        </label>

        <div>
          <button type="submit" disabled={loading} style={{ padding: '10px 16px' }}>
            {loading ? 'Creating…' : 'Create Customer'}
          </button>
        </div>

        <hr />

        <h2>Bulk upload photos</h2>
        <p className="text-sm text-gray-600">Select files to upload and they will be uploaded directly to Cloudflare R2 using presigned URLs.</p>
        <input type="file" multiple className="mb-4" onChange={async (e) => {
          const files = Array.from(e.target.files || [])
          for (const file of files) {
            const f = file
            const progressId = toast.add(`Uploading ${f.name}...`, { sticky: true, duration: 60000 })
            try {
              // get presigned url
              const pres = await fetch('/api/upload/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: f.name, contentType: f.type, userEmail: email })
              })
              const presData = await pres.json()
              if (!pres.ok) throw new Error(presData?.error || 'Failed to get presign')

              // upload file with progress
              await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('PUT', presData.url)
                xhr.setRequestHeader('Content-Type', f.type)
                xhr.upload.onprogress = (ev) => {
                  if (ev.lengthComputable) {
                    const pct = Math.round((ev.loaded / ev.total) * 100)
                    toast.update(progressId, `Uploading ${f.name}: ${pct}%`)
                  }
                }
                xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) resolve()
                  else reject(new Error('Upload failed'))
                }
                xhr.onerror = reject
                xhr.send(f)
              })

              // let server record and process the upload
              const done = await fetch('/api/admin/complete-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: presData.key, filename: f.name, contentType: f.type, size: f.size, userEmail: email })
              })
              const doneData = await done.json()
              if (!done.ok) throw new Error(doneData?.error || 'Failed to complete upload')
              toast.update(progressId, `Uploaded ${f.name}`)
              setTimeout(() => toast.remove(progressId), 2500)
            } catch (err) {
              toast.update(progressId, `Failed to upload ${file.name}: ${err.message}`)
              setTimeout(() => toast.remove(progressId), 5000)
            }
          }
        }} />

        {message && (
          <div style={{ marginTop: 12, color: message.type === 'error' ? '#b91c1c' : message.type === 'success' ? '#065f46' : '#0c4a6e' }}>{message.text}</div>
        )}
      </form>
    </div>
  )
}
