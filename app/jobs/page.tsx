"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, DollarSign, Calendar, AlertCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { jobsService, type Job } from "@/lib/firestore-service"
import { useAuth } from "@/lib/auth-context"
import { ProposalModal } from "@/components/proposal-modal"
import { Header } from "@/components/header"

const categories = ["All", "Carpenter", "Mason", "Plumber", "Teacher", "Writer", "Electrician", "Driver", "Other"]
const districts = ["All Districts", "Dimapur", "Kohima", "Mokokchung", "Wokha", "Zunheboto", "Phek", "Tuensang", "Mon"]
const budgetRanges = ["All Budgets", "Under ₹5,000", "₹5,000 - ₹15,000", "₹15,000 - ₹30,000", "Above ₹30,000"]

// Fallback sample jobs in case Firestore is not accessible
const sampleJobs: Job[] = [
  {
    id: "sample-1",
    title: "Custom Kitchen Cabinets Installation",
    category: "carpenter",
    description:
      "Need an experienced carpenter to design and install custom kitchen cabinets. The kitchen is 12x10 feet. Looking for someone with experience in modular kitchen work.",
    budget: "₹25,000 - ₹35,000",
    location: "dimapur",
    timeline: "Within 2 weeks",
    requirements: "5+ years experience, Own tools, Portfolio required",
    contactMethod: "",
    urgency: "normal" as const,
    status: "open" as const,
    clientId: "sample-client-1",
    clientName: "Ravi Kumar",
    clientRating: 4.6,
    proposals: 8,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "sample-2",
    title: "English Tuition for Class 10 Student",
    category: "teacher",
    description:
      "Looking for a qualified English teacher for my daughter who is in Class 10 CBSE. Need help with literature and grammar. Prefer someone with CBSE experience.",
    budget: "₹8,000 - ₹12,000/month",
    location: "kohima",
    timeline: "Start immediately",
    requirements: "B.Ed qualification, CBSE experience, Good communication",
    contactMethod: "",
    urgency: "urgent" as const,
    status: "open" as const,
    clientId: "sample-client-2",
    clientName: "Merenla Jamir",
    clientRating: 4.8,
    proposals: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

export default function JobsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All Districts")
  const [selectedBudget, setSelectedBudget] = useState("All Budgets")
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [usingFallback, setUsingFallback] = useState(false)

  // Load jobs from Firestore
  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      setError("")
      setUsingFallback(false)

      console.log("Attempting to load jobs from Firestore...")
      const data = await jobsService.getJobs()
      console.log("Successfully loaded jobs:", data.length)

      if (data.length === 0) {
        // If no jobs in database, use sample data
        console.log("No jobs found in database, using sample data")
        setJobs(sampleJobs)
        setFilteredJobs(sampleJobs)
        setUsingFallback(true)
      } else {
        setJobs(data)
        setFilteredJobs(data)
      }
    } catch (error: any) {
      console.error("Error loading jobs:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      })

      // Use sample data as fallback
      console.log("Using fallback sample data due to error")
      setJobs(sampleJobs)
      setFilteredJobs(sampleJobs)
      setUsingFallback(true)

      // Set user-friendly error message based on error type
      if (error.message && error.message.includes("toDate")) {
        setError("Data format issue detected. Showing sample jobs instead.")
      } else if (error.code === "permission-denied") {
        setError("Database permissions issue. Showing sample jobs instead.")
      } else if (error.code === "unavailable") {
        setError("Service temporarily unavailable. Showing sample jobs instead.")
      } else {
        setError(`Unable to load live jobs (${error.message || "Unknown error"}). Showing sample jobs instead.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProposalSubmitted = () => {
    // Reload jobs to get updated proposal count
    loadJobs()
  }

  const handleSearch = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((job) => job.category.toLowerCase() === selectedCategory.toLowerCase())
    }

    if (selectedLocation !== "All Districts") {
      filtered = filtered.filter((job) => job.location.toLowerCase() === selectedLocation.toLowerCase())
    }

    if (selectedBudget !== "All Budgets") {
      // Add budget filtering logic if needed
      // This would require parsing the budget strings and comparing ranges
    }

    setFilteredJobs(filtered)
  }

  // Auto-search when filters change
  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedCategory, selectedLocation, selectedBudget, jobs])

  const getUrgencyColor = (urgency: string) => {
    return urgency === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find opportunities that match your skills in Nagaland</p>
        </div>

        {/* Error/Fallback Notice */}
        {(error || usingFallback) && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{error || "Showing sample jobs"}</p>
                    {!user && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Sign in to see all available jobs and post your own
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadJobs}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                  {!user && (
                    <Button size="sm" onClick={() => (window.location.href = "/login")}>
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
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
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                Search Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredJobs.length} jobs
            {usingFallback && <span className="text-yellow-600"> (sample data)</span>}
          </p>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge className={getUrgencyColor(job.urgency)}>
                        {job.urgency === "urgent" ? "Urgent" : "Normal"}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ").toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(job.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.budget}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-4 capitalize">
                    {job.category}
                  </Badge>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {job.requirements && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-600">{job.requirements}</p>
                    </div>
                  )}
                  {job.timeline && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Timeline:</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {job.timeline}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                          {getInitials(job.clientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{job.clientName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>★ {job.clientRating || 0}</span>
                          <span>•</span>
                          <span>Client</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">{job.proposals} proposals</div>
                    {usingFallback ? (
                      <Button disabled>Demo Mode</Button>
                    ) : (
                      <ProposalModal job={job} onProposalSubmitted={handleProposalSubmitted} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 text-lg mb-4">No jobs match your current search criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
                setSelectedLocation("All Districts")
                setSelectedBudget("All Budgets")
                setFilteredJobs(jobs)
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
