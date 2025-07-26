"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, User, Briefcase } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "client" as "client" | "professional" | "both",
    location: "",
    profession: "",
    skills: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if ((formData.userType === "professional" || formData.userType === "both") && !formData.profession) {
      setError("Please select your profession")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setLoading(true)

    try {
      const userData = {
        displayName: formData.displayName,
        userType: formData.userType,
        location: formData.location,
        profession:
          formData.userType === "professional" || formData.userType === "both" ? formData.profession : undefined,
        skills:
          (formData.userType === "professional" || formData.userType === "both") && formData.skills
            ? formData.skills.split(",").map((s) => s.trim())
            : [],
      }

      await signUp(formData.email, formData.password, userData)
      router.push("/")
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              NF
            </div>
            <span className="text-xl font-bold text-green-800">NagaFreelance</span>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join the largest freelance community in Nagaland</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>I want to:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer transition-colors ${
                    formData.userType === "client" ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("userType", "client")}
                >
                  <CardContent className="p-4 text-center">
                    <User className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Hire Only</h3>
                    <p className="text-sm text-gray-600">Post jobs and find skilled workers</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-colors ${
                    formData.userType === "professional" ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("userType", "professional")}
                >
                  <CardContent className="p-4 text-center">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Work Only</h3>
                    <p className="text-sm text-gray-600">Find jobs and earn money</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-colors ${
                    formData.userType === "both" ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("userType", "both")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <User className="w-6 h-6 text-green-600 mr-1" />
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium">Both</h3>
                    <p className="text-sm text-gray-600">Hire professionals and offer services</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your full name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select onValueChange={(value) => handleInputChange("location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your district" />
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

            {(formData.userType === "professional" || formData.userType === "both") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profession">Your Profession *</Label>
                  <Select onValueChange={(value) => handleInputChange("profession", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your profession" />
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

                <div className="space-y-2">
                  <Label htmlFor="skills">Your Skills</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Furniture Making, Home Renovation (comma separated)"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Separate multiple skills with commas</p>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={setAgreedToTerms} />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-green-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
