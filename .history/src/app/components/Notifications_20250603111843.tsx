"use client"

import { useState, useEffect, type ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = "success" | "error" | "info"

interface NotificationProps {
  message: string
  type?: NotificationType
  duration?: number
  onClose?: () => void
  isVisible?: boolean
}

export function Notification({
  message,
  type = "info",
  duration = 5000,
  onClose,
  isVisible = true,
}: NotificationProps) {
  const [visible, setVisible] = useState(isVisible)

  useEffect(() => {
    setVisible(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md transform transition-all duration-500 ease-in-out",
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg",
          type === "success" && "bg-green-500 text-white",
          type === "error" && "bg-red-500 text-white",
          type === "info" && "bg-[#52c1ff] text-white",
        )}
      >
        <div className="flex-shrink-0">
          {type === "success" && <CheckCircle className="h-5 w-5" />}
          {type === "error" && <AlertCircle className="h-5 w-5" />}
          {type === "info" && <Info className="h-5 w-5" />}
        </div>
        <div className="flex-1">{message}</div>
        <button
          onClick={() => {
            setVisible(false)
            onClose?.()
          }}
          className="flex-shrink-0 rounded-full p-1 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export type NotificationContextType = {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void
  hideNotification: () => void
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<{
    message: string
    type: NotificationType
    visible: boolean
    duration: number
  } | null>(null)

  const showNotification = (message: string, type: NotificationType = "info", duration = 5000) => {
    setNotification({ message, type, visible: true, duration })
  }

  const hideNotification = () => {
    setNotification((prev) => (prev ? { ...prev, visible: false } : null))
  }

  return (
    <>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.visible}
          duration={notification.duration}
          onClose={hideNotification}
        />
      )}
    </>
  )
}

// Custom hook to use notifications
export function useNotification() {
  const [notification, setNotification] = useState<{
    message: string
    type: NotificationType
    visible: boolean
    duration: number
  } | null>(null)

  const showNotification = (message: string, type: NotificationType = "info", duration = 5000) => {
    setNotification({ message, type, visible: true, duration })
  }

  const hideNotification = () => {
    setNotification((prev) => (prev ? { ...prev, visible: false } : null))
  }

  return {
    notification,
    showNotification,
    hideNotification,
    Notification: notification ? (
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        duration={notification.duration}
        onClose={hideNotification}
      />
    ) : null,
  }
}
