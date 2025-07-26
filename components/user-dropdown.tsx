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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Settings,
  Briefcase,
  Star,
  HelpCircle,
  LogOut,
  ChevronDown,
  Shield,
  Bell,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function UserDropdown() {
  const { user, userProfile, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user || !userProfile) return null

  // Add fallback values
  const displayName = userProfile.displayName || user.displayName || user.email || "User"
  const userEmail = user.email || "No email"

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== "string") return "U"

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) // Limit to 2 characters max
  }

  const getUserTypeLabel = () => {
    switch (userProfile.userType) {
      case "client":
        return "Client"
      case "professional":
        return "Professional"
      case "both":
        return "Client & Professional"
      default:
        return "User"
    }
  }

  const getUserTypeColor = () => {
    switch (userProfile.userType) {
      case "client":
        return "bg-blue-100 text-blue-800"
      case "professional":
        return "bg-green-100 text-green-800"
      case "both":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.photoURL || undefined} alt={displayName} />
            <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">{displayName}</span>
            <Badge className={`text-xs ${getUserTypeColor()}`}>{getUserTypeLabel()}</Badge>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Header */}
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.photoURL || undefined} alt={displayName} />
              <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{userEmail}</p>
              <Badge className={`text-xs mt-1 ${getUserTypeColor()}`}>{getUserTypeLabel()}</Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <Briefcase className="w-4 h-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        {/* Profile Management */}
        {(userProfile.userType === "professional" || userProfile.userType === "both") && (
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              Professional Profile
            </Link>
          </DropdownMenuItem>
        )}

        {/* Account Settings */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>

        {/* Notifications */}
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center gap-2 cursor-pointer">
            <Bell className="w-4 h-4" />
            Notifications
            <Badge variant="secondary" className="ml-auto text-xs">
              3
            </Badge>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Client-specific options */}
        {(userProfile.userType === "client" || userProfile.userType === "both") && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/post-job" className="flex items-center gap-2 cursor-pointer">
                <Briefcase className="w-4 h-4" />
                Post a Job
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-jobs" className="flex items-center gap-2 cursor-pointer">
                <Star className="w-4 h-4" />
                My Jobs
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* Professional-specific options */}
        {(userProfile.userType === "professional" || userProfile.userType === "both") && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/jobs" className="flex items-center gap-2 cursor-pointer">
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-proposals" className="flex items-center gap-2 cursor-pointer">
                <Star className="w-4 h-4" />
                My Proposals
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Billing & Payments */}
        <DropdownMenuItem asChild>
          <Link href="/billing" className="flex items-center gap-2 cursor-pointer">
            <CreditCard className="w-4 h-4" />
            Billing & Payments
          </Link>
        </DropdownMenuItem>

        {/* Verification Status */}
        {userProfile.verified ? (
          <DropdownMenuItem disabled>
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Verified Account</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/verify" className="flex items-center gap-2 cursor-pointer">
              <Shield className="w-4 h-4" />
              Get Verified
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
