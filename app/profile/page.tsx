"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, MapPin, Star, Shield, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { professionalsService, type ProfessionalProfile } from "@/lib/firestore-service"
import { Header } from "@/components/header"

const districts = [
  "Dimapur",
  "Kohima",
  "Mokokchung",
  "Wokha",
  "Zunheboto",
  "Phek",
  "Tuensang",
  "Mon",
  "Longleng",
  "Kiphire",
  "Peren",
  "Noklak",
  "Chumoukedima",
  "Niuland",
  "Tseminyu",
  "Shamator",
]

const professions = [
  "Carpenter",
  "Mason",
  "Plumber",
  "Electrician",
  "Teacher",
  "Writer",
  "Shopkeeper",
  "Driver",
  "Cleaner",
  "Cook",
  "Gardener",
  "Other",
]

const languages = [
  "English",
  "Hindi",
  "Nagamese",
  "Ao",
  "Angami",
  "Sumi",
  "Lotha",
  "Sangtam",
  "Yimchunger",
  "Khiamniungan",
  "Chang",
  "Phom",
  "Konyak",
]

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile } = useAuth()
  const router = useRouter()
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    location: "",
    hourlyRate: "",
    skills: "",
    description: "",
    responseTime: "",
    selectedLanguages: [] as string[],
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user && userProfile) {
      loadProfessionalProfile()
    }
  }, [user, userProfile, loading])

  const loadProfessionalProfile = async () => {
    if (!user) return

    try {
      const profile = await professionalsService.getProfessionalByUserId(user.uid)
      if (profile) {
        setProfessionalProfile(profile)
        setFormData({
          name: profile.name,
          profession: profile.profession,
          location: profile.location,
          hourlyRate: profile.hourlyRate,
          skills: profile.skills.join(", "),
          description: profile.description,
          responseTime: profile.responseTime,
          selectedLanguages: profile.languages,
        })
      } else {
        // Initialize with user profile data
        setFormData({
          name: userProfile?.displayName || "",
          profession: userProfile?.profession || "",
          location: userProfile?.location || "",
          hourlyRate: "",
          skills: userProfile?.skills?.join(", ") || "",
          description: "",
          responseTime: "Within 24 hours",
          selectedLanguages: ["English", "Nagamese"],
        })
      }
    } catch (error) {
      console.error("Error loading professional profile:", error)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(language)
        ? prev.selectedLanguages.filter((l) => l !== language)
        : [...prev.selectedLanguages, language],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    if (!user || !userProfile) return

    try {
      const profileData = {
        userId: user.uid,
        name: formData.name,
        profession: formData.profession,
        location: formData.location,
        hourlyRate: formData.hourlyRate,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        description: formData.description,
        responseTime: formData.responseTime,
        languages: formData.selectedLanguages,
        rating: professionalProfile?.rating || 0,
        reviews: professionalProfile?.reviews || 0,
        completedJobs: professionalProfile?.completedJobs || 0,
        verified: professionalProfile?.verified || false,
      }

      if (professionalProfile?.id) {
        await professionalsService.updateProfile(professionalProfile.id, profileData)
      } else {
        await professionalsService.createProfile(profileData)
      }

      // Update user profile if needed
      await updateUserProfile({
        profession: formData.profession,
        location: formData.location,
        skills: profileData.skills,
      })

      setSuccess("Profile updated successfully!")
      loadProfessionalProfile() // Reload to get updated data
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const isProfessional = userProfile.userType === "professional" || userProfile.userType === "both"

  if (!isProfessional) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Professional Profile Not Available</h2>
              <p className="text-gray-600 mb-4">You need to be registered as a professional to access this page.</p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Profile</h1>
          <p className="text-gray-600">Manage your professional information and showcase your skills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Keep your profile updated to attract more clients</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession *</Label>
                      <Select
                        value={formData.profession}
                        onValueChange={(value) => handleInputChange("profession", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {professions.map((profession) => (
                            <SelectItem key={profession} value={profession}>
                              {profession}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate</Label>
                      <Input
                        id="hourlyRate"
                        placeholder="e.g., ₹300-500/hr"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      placeholder="e.g., Furniture Making, Home Renovation (comma separated)"
                      value={formData.skills}
                      onChange={(e) => handleInputChange("skills", e.target.value)}
                    />
                    <p className="text-sm text-gray-500">Separate multiple skills with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Professional Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your experience, specializations, and what makes you unique..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responseTime">Response Time</Label>
                    <Select
                      value={formData.responseTime}
                      onValueChange={(value) => handleInputChange("responseTime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Within 1 hour">Within 1 hour</SelectItem>
                        <SelectItem value="Within 2 hours">Within 2 hours</SelectItem>
                        <SelectItem value="Within 4 hours">Within 4 hours</SelectItem>
                        <SelectItem value="Within 24 hours">Within 24 hours</SelectItem>
                        <SelectItem value="Within 2 days">Within 2 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((language) => (
                        <Badge
                          key={language}
                          variant={formData.selectedLanguages.includes(language) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleLanguageToggle(language)}
                        >
                          {language}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Click to select languages you speak</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Profile Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{formData.name || "Your Name"}</h3>
                  <p className="text-gray-600">{formData.profession || "Your Profession"}</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    {formData.location || "Your Location"}
                  </div>
                </div>

                {professionalProfile && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{professionalProfile.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{professionalProfile.reviews} reviews</span>
                    <span>•</span>
                    <span>{professionalProfile.completedJobs} jobs</span>
                  </div>
                )}

                {formData.hourlyRate && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{formData.hourlyRate}</div>
                  </div>
                )}

                {formData.skills && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.split(",").map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.selectedLanguages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Languages</h4>
                    <p className="text-sm text-gray-600">{formData.selectedLanguages.join(", ")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {professionalProfile?.verified && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Verified Professional</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Your profile has been verified by our team</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
