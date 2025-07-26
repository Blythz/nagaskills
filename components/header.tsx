"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export function Header() {
  const { user, userProfile } = useAuth()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
            NF
          </div>
          <span className="text-xl font-bold text-green-800">NagaFreelance</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/jobs" className="text-gray-600 hover:text-green-600">
            Find Jobs
          </Link>
          <Link href="/professionals" className="text-gray-600 hover:text-green-600">
            Find Professionals
          </Link>
          <Link href="/post-job" className="text-gray-600 hover:text-green-600">
            Post Job
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationsDropdown />
              <UserDropdown />
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
