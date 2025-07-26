"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { jobsService } from "@/lib/firestore-service"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

const categories = [
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

const budgetRanges = [
  "Under ₹1,000",
  "₹1,000 - ₹5,000",
  "₹5,000 - ₹10,000",
  "₹10,000 - ₹25,000",
  "₹25,000 - ₹50,000",
  "Above ₹50,000",
]

export default function PostJobPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    budget: "",
    timeline: "",
    requirements: "",
    contactMethod: "",
    urgency: "normal",
  })

  const [validationScore, setValidationScore] = useState(0)
  const [showValidation, setShowValidation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const calculateValidationScore = () => {
    let score = 0
    if (formData.title.length >= 10) score += 20
    if (formData.description.length >= 50) score += 30
    if (formData.category) score += 15
    if (formData.location) score += 15
    if (formData.budget) score += 10
    if (formData.timeline) score += 10
    return score
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const newScore = calculateValidationScore()
    setValidationScore(newScore)
    setShowValidation(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user || !userProfile) {
      setError("You must be logged in to post a job")
      return
    }

    if (validationScore < 60) {
      setError("Please improve your post quality to continue. Minimum 60% score required.")
      return
    }

    setSubmitting(true)

    try {
      const jobData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        budget: formData.budget,
        timeline: formData.timeline,
        requirements: formData.requirements,
        contactMethod: formData.contactMethod,
        urgency: formData.urgency as "normal" | "urgent",
        status: "open" as const,
        clientId: user.uid,
        clientName: userProfile.displayName,
        clientRating: userProfile.clientRating || 0,
      }

      const jobId = await jobsService.createJob(jobData)

      // Redirect to dashboard or job details
      router.push(`/dashboard?tab=jobs&success=Job posted successfully!`)
    } catch (error: any) {
      setError(error.message || "Failed to post job")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const getValidationColor = () => {
    if (validationScore >= 80) return "text-green-600"
    if (validationScore >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getValidationMessage = () => {
    if (validationScore >= 80) return "Excellent! Your job post looks comprehensive."
    if (validationScore >= 60) return "Good job post. Consider adding more details."
    return "Please provide more details to improve your job post quality."
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
          <p className="text-gray-600">Find the right professional for your project in Nagaland</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Provide clear and detailed information to attract the right professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Need a carpenter to build custom furniture"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">Be specific about what you need done</p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => handleInputChange("category", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. What needs to be done? What materials are required? Any specific requirements?"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Minimum 50 characters. More details help professionals understand your needs better.
                    </p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select onValueChange={(value) => handleInputChange("location", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district.toLowerCase()}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => handleInputChange("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., Within 1 week, By end of month"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange("timeline", e.target.value)}
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Special Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Any specific skills, tools, or qualifications needed?"
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                    />
                  </div>

                  {/* Contact Method */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Preferred Contact Method</Label>
                    <Input
                      id="contact"
                      placeholder="Phone number or email"
                      value={formData.contactMethod}
                      onChange={(e) => handleInputChange("contactMethod", e.target.value)}
                    />
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label>Urgency Level</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="normal"
                          checked={formData.urgency === "normal"}
                          onCheckedChange={() => handleInputChange("urgency", "normal")}
                        />
                        <Label htmlFor="normal">Normal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgent"
                          checked={formData.urgency === "urgent"}
                          onCheckedChange={() => handleInputChange("urgency", "urgent")}
                        />
                        <Label htmlFor="urgent">Urgent</Label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={validationScore < 60 || submitting}>
                    {submitting ? "Posting Job..." : "Post Job (₹50)"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validation Score */}
            {showValidation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Post Quality Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quality Score</span>
                      <span className={`text-lg font-bold ${getValidationColor()}`}>{validationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          validationScore >= 80
                            ? "bg-green-500"
                            : validationScore >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${validationScore}%` }}
                      />
                    </div>
                    <p className={`text-sm ${getValidationColor()}`}>{getValidationMessage()}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Anti-Spam Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Posting Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">✓ Good Posts Include:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clear job description</li>
                    <li>• Realistic budget</li>
                    <li>• Specific location</li>
                    <li>• Timeline expectations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">✗ Avoid:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Vague descriptions</li>
                    <li>• Unrealistic budgets</li>
                    <li>• Duplicate posts</li>
                    <li>• Spam or fake jobs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Posting Fee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">₹50</div>
                  <p className="text-sm text-gray-600 mb-4">One-time posting fee to prevent spam and ensure quality</p>
                  <Badge variant="secondary" className="mb-4">
                    Refundable if job is completed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {validationScore < 60 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please improve your post quality to continue. Minimum 60% score required.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
