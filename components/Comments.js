import { useEffect, useState } from 'react'

export default function Comments({ photoId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    let canceled = false
    async function load() {
      const res = await fetch(`/api/comments?photoId=${encodeURIComponent(photoId)}`)
      const data = await res.json()
      if (!canceled) setComments(data)
    }
    if (photoId) load()
    return () => { canceled = true }
  }, [photoId])

  async function post() {
    if (!name || !text) return alert('Please enter your name and message')
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photoId, author: name, text }) })
    if (!res.ok) return alert('Failed to post')
    const data = await res.json()
    setComments((c) => [...c, data.comment])
    setText('')
  }

  return (
    <div>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="border rounded p-2">
            <div className="text-sm font-semibold">{c.author} <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span></div>
            <div className="text-sm text-gray-600">{c.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <input value={name} onChange={(e)=> setName(e.target.value)} className="w-full border rounded px-2 py-1 mb-2" placeholder="Your name" />
        <textarea value={text} onChange={(e)=> setText(e.target.value)} className="w-full border rounded px-2 py-1 mb-2" placeholder="Leave a message" />
        <button onClick={post} className="bg-primary text-white px-3 py-1 rounded">Post comment</button>
      </div>
    </div>
  )
}
