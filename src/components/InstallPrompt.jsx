import React, { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa_dismissed')) return
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
      setPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in md:left-auto md:right-4 md:w-96">
      <div className="bg-dark-800 border border-primary-500/30 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-100">ติดตั้งแอปบนมือถือ</p>
            <p className="text-xs text-dark-400 mt-0.5">ใช้งานได้เหมือนแอปจริง ไม่ต้องเปิด browser</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-dark-500 hover:text-dark-300 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            ติดตั้งเลย
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-xl text-sm font-medium transition-colors"
          >
            ไม่ตอนนี้
          </button>
        </div>
      </div>
    </div>
  )
}
