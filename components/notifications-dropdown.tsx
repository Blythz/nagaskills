"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, CheckCheck, Briefcase, MessageCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useNotifications } from "@/lib/notifications-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, error, refreshNotifications } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const router = useRouter()

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

    setOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "proposal_received":
        return <MessageCircle className="w-4 h-4 text-blue-600" />
      case "proposal_accepted":
        return <CheckCheck className="w-4 h-4 text-green-600" />
      case "proposal_rejected":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "job_posted":
        return <Briefcase className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-1">
            {error && (
              <Button variant="ghost" size="sm" onClick={refreshNotifications} className="text-xs h-auto p-1">
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {error ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-2">Failed to load notifications</p>
            <Button variant="outline" size="sm" onClick={refreshNotifications}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn("flex items-start gap-3 p-3 cursor-pointer", !notification.read && "bg-blue-50")}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                    {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-1">{notification.message}</p>
                  <p className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt)}</p>
                </div>
              </DropdownMenuItem>
            ))}

            {notifications.length > 10 && (
              <DropdownMenuItem
                className="text-center text-sm text-blue-600 cursor-pointer"
                onClick={() => {
                  router.push("/notifications")
                  setOpen(false)
                }}
              >
                View all notifications
              </DropdownMenuItem>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
