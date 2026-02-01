import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, opts = {}) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
    const toast = { id, message, ...opts }
    setToasts((t) => [...t, toast])
    if (!opts.sticky) setTimeout(() => remove(id), opts.duration || 5000)
    return id
  }, [])

  const update = useCallback((id, message, opts = {}) => {
    setToasts((t) => t.map((x) => x.id === id ? { ...x, message, ...opts } : x))
  }, [])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ add, update, remove, toasts }}>
      {children}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className="bg-white shadow-md border border-gray-200 px-4 py-2 rounded-md text-sm">
            {t.message}
            <button className="ml-3 text-xs text-gray-400" onClick={() => remove(t.id)}>Dismiss</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
