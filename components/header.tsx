"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const navItems = [
    { name: 'Find Jobs', href: '/jobs' },
    { name: 'Find Professionals', href: '/professionals' },
    { name: 'Post Job', href: '/post-job' },
  ]

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
              
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 font-bold text-white">
                  NF
                </div>
                <span className="text-xl font-bold text-green-800 dark:text-green-400">NagaFreelance</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-green-600',
                    pathname === item.href ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <div className="hidden md:block">
                    <NotificationsDropdown />
                  </div>
                  <UserDropdown />
                </>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Sign up</Link>
                  </Button>
                </div>
              )}
              
              {/* Join button for mobile */}
              {!user && (
                <div className="md:hidden">
                  <Button size="sm" asChild>
                    <Link href="/register">Join</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          isMenuOpen ? "block" : "hidden"
        )}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu content */}
        <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-950 shadow-lg">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 font-bold text-white">
                  NF
                </div>
                <span className="text-xl font-bold text-green-800 dark:text-green-400">NagaFreelance</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname === item.href
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {!user && (
              <div className="border-t p-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
