import React from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export default function Toast() {
  const { toast, showToast } = useApp()
  if (!toast) return null

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-primary-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
  }

  const borders = {
    success: 'border-primary-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  }

  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center gap-3
      bg-dark-800 border ${borders[toast.type] || borders.success}
      rounded-2xl px-4 py-3 shadow-2xl shadow-black/40
      animate-slide-up
    `}>
      {icons[toast.type] || icons.success}
      <span className="text-sm font-medium text-dark-100">{toast.message}</span>
      <button
        onClick={() => showToast(null)}
        className="ml-1 text-dark-500 hover:text-dark-300 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
