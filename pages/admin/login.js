import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setError(res.error)
    } else {
      window.location.href = '/admin'
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Admin sign in</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" type="email" required />
        </label>
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" type="password" required />
        </label>
        <div>
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">{loading ? 'Signing in…' : 'Sign in'}</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  )
}
