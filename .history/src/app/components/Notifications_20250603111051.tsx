"use client"
import { useEffect } from "react"

export default function Notification({
  message,
  show,
  onClose,
}: {
  message: string
  show: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed top-6 left-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-in">
      ✅ {message}
    </div>
  )
}
