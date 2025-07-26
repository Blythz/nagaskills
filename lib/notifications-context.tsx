"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { notificationsService, type Notification } from "./notifications-service"

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe to real-time notifications with error handling
    const unsubscribe = notificationsService.subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter((n) => !n.read).length)
      setLoading(false)
      setError(null)
    })

    // Handle subscription errors
    const handleError = (err: any) => {
      console.error("Notifications subscription error:", err)
      setError("Failed to load notifications")
      setLoading(false)

      // Fallback to manual fetch
      refreshNotifications()
    }

    return () => {
      try {
        unsubscribe()
      } catch (err) {
        handleError(err)
      }
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId)
      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
      setError("Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      await notificationsService.markAllAsRead(user.uid)
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      setError("Failed to mark all notifications as read")
    }
  }

  const refreshNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const newNotifications = await notificationsService.getNotifications(user.uid)
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Error refreshing notifications:", error)
      setError("Failed to refresh notifications")
      // Set empty array as fallback
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
