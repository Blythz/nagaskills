"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Check,
  CheckCheck,
  Briefcase,
  MessageCircle,
  AlertCircle,
  BookMarkedIcon as MarkAsUnread,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications-context"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.data?.jobId) {
      if (notification.type === "proposal_received") {
        router.push(`/my-jobs/${notification.data.jobId}/proposals`)
      } else if (notification.type === "proposal_accepted" || notification.type === "proposal_rejected") {
        router.push("/my-proposals")
      } else if (notification.type === "job_posted") {
        router.push("/my-jobs")
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "proposal_received":
        return <MessageCircle className="w-5 h-5 text-blue-600" />
      case "proposal_accepted":
        return <CheckCheck className="w-5 h-5 text-green-600" />
      case "proposal_rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "job_posted":
        return <Briefcase className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with your job activities</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                </div>
                <MarkAsUnread className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-gray-900">{readNotifications.length}</p>
                </div>
                <CheckCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">
                You'll see notifications here when there's activity on your jobs and proposals.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => markAsRead(notification.id!)}
                  getIcon={getNotificationIcon}
                  formatDate={formatDate}
                />
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No unread notifications</p>
                  </CardContent>
                </Card>
              ) : (
                unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => markAsRead(notification.id!)}
                    getIcon={getNotificationIcon}
                    formatDate={formatDate}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {readNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No read notifications</p>
                  </CardContent>
                </Card>
              ) : (
                readNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => markAsRead(notification.id!)}
                    getIcon={getNotificationIcon}
                    formatDate={formatDate}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

interface NotificationCardProps {
  notification: any
  onClick: () => void
  onMarkAsRead: () => void
  getIcon: (type: string) => React.ReactNode
  formatDate: (date: Date) => string
}

function NotificationCard({ notification, onClick, onMarkAsRead, getIcon, formatDate }: NotificationCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-gray-50",
        !notification.read && "border-l-4 border-l-blue-500 bg-blue-50/30",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkAsRead()
                    }}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark read
                  </Button>
                )}
                <span className="text-sm text-gray-500">{formatDate(notification.createdAt)}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">{notification.message}</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {notification.type.replace("_", " ")}
              </Badge>
              {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
