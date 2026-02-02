import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AdminFolders() {
  const { data: session } = useSession()
  const router = useRouter()
  const [folders, setFolders] = useState({})
  const [stats, setStats] = useState({})
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [photos, setPhotos] = useState([])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [moveTarget, setMoveTarget] = useState('')

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadFolders()
  }, [session, router])

  const loadFolders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/folders')
      const data = await res.json()
      setFolders(data.folders || [])
      setStats(data.stats || {})

      // Load photos for display
      const photoRes = await fetch('/api/gallery?admin=1')
      const photoData = await photoRes.json()
      setPhotos(photoData.photos || [])
    } finally {
      setLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', newName: newFolderName }),
      })
      setNewFolderName('')
      loadFolders()
    } catch (err) {
      alert('Failed to create folder')
    }
  }

  const renameFolder = async (oldName, newName) => {
    if (!newName.trim()) return
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', oldName, newName }),
      })
      setEditingFolder(null)
      loadFolders()
    } catch (err) {
      alert('Failed to rename folder')
    }
  }

  const deleteFolder = async (folderName) => {
    if (!confirm(`Delete folder "${folderName}"? Photos will be moved to Unsorted.`)) return
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', oldName: folderName }),
      })
      loadFolders()
    } catch (err) {
      alert('Failed to delete folder')
    }
  }

  const movePhotos = async () => {
    if (!moveTarget || selectedPhotos.length === 0) return
    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          photoIds: selectedPhotos,
          targetFolder: moveTarget,
        }),
      })
      setSelectedPhotos([])
      setMoveTarget('')
      setSelectedFolder(null)
      loadFolders()
    } catch (err) {
      alert('Failed to move photos')
    }
  }

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    )
  }

  if (loading) return <Layout><div className="p-8 text-center">Loading...</div></Layout>
  if (session?.user?.role !== 'admin') return <Layout><div className="p-8 text-center">Admin only</div></Layout>

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-playfair">Folder Management</h1>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Back to Admin</Link>
        </div>

        {/* Create Folder */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Folder name (e.g., 'Ceremony', 'Reception')"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createFolder}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
            >
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Folders List */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Folders ({folders.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {folders.map((folder) => (
                <div key={folder} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    {editingFolder === folder ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => renameFolder(folder, editingName)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingFolder(null)}
                          className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedFolder(folder)
                          setSelectedPhotos([])
                        }}
                        className="text-sm font-medium text-blue-600 hover:underline text-left"
                      >
                        {folder} <span className="text-gray-500">({stats[folder] || 0})</span>
                      </button>
                    )}
                  </div>
                  {editingFolder !== folder && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingFolder(folder)
                          setEditingName(folder)
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => deleteFolder(folder)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photos in Selected Folder */}
          {selectedFolder && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">
                {selectedFolder} ({photos.filter((p) => (p.folder || 'Unsorted') === selectedFolder).length} photos)
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {photos
                  .filter((p) => (p.folder || 'Unsorted') === selectedFolder)
                  .map((photo) => (
                    <label
                      key={photo.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(photo.id)}
                        onChange={() => togglePhotoSelection(photo.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm flex-1 truncate">{photo.filename || photo.id}</span>
                    </label>
                  ))}
              </div>

              {selectedPhotos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">{selectedPhotos.length} photo(s) selected</p>
                  <div className="flex gap-2">
                    <select
                      value={moveTarget}
                      onChange={(e) => setMoveTarget(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Move to folder...</option>
                      {folders
                        .filter((f) => f !== selectedFolder)
                        .map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={movePhotos}
                      disabled={!moveTarget}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Move
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
