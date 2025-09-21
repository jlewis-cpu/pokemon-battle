import React from 'react'

export default function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={"relative bg-white rounded-2xl shadow-xl border border-gray-200 max-w-xl w-[92%] p-6 " + className}>
        <button className="absolute top-3 right-3 rounded-lg px-2 py-1 text-sm border" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  )
}
