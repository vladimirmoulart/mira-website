// src/app/components/Notifications.tsx
"use client"

import { useState } from "react"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

type NotificationType = "success" | "error" | "info"

interface NotificationState {
  message: string
  type: NotificationType
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(null)

  const showNotification = (message: string, type: NotificationType = "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  }

  return {
    showNotification,
    Notification: notification ? (
      <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg bg-white border-l-4
        ${notification.type === "success" ? "border-green-500" : notification.type === "error" ? "border-red-500" : "border-blue-500"}
      `}>
        <div className="flex items-center gap-2">
          {iconMap[notification.type]}
          <span className="text-sm font-medium text-gray-800">{notification.message}</span>
        </div>
      </div>
    ) : null,
  }
}
