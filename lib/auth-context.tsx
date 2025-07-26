"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

interface UserProfile {
  uid: string
  email: string
  displayName: string
  userType: "client" | "professional" | "both" // Changed this line
  location?: string
  profession?: string
  skills?: string[]
  rating?: number
  completedJobs?: number
  verified?: boolean
  createdAt: Date
  // Add client-specific fields
  clientRating?: number
  jobsPosted?: number
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    // Update display name
    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName })
    }

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: userData.displayName || "",
      userType: userData.userType || "client",
      location: userData.location,
      profession: userData.profession,
      skills: userData.skills || [],
      rating: 0,
      completedJobs: 0,
      verified: false,
      clientRating: 0,
      jobsPosted: 0,
      createdAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)
    setUserProfile(userProfile)

    // If user chose "both" or "professional", create professional profile
    if (userData.userType === "professional" || userData.userType === "both") {
      const professionalProfile = {
        userId: user.uid,
        name: userData.displayName || "",
        profession: userData.profession || "",
        location: userData.location || "",
        rating: 0,
        reviews: 0,
        completedJobs: 0,
        hourlyRate: "",
        skills: userData.skills || [],
        description: "",
        responseTime: "Within 24 hours",
        languages: ["English", "Nagamese"],
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "professionals", user.uid), professionalProfile)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return

    const updatedProfile = { ...userProfile, ...data }
    await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true })
    setUserProfile(updatedProfile as UserProfile)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
