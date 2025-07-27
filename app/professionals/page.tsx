"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  MessageSquare,
  Search,
  Filter,
  AlertCircle,
  Languages,
  Award,
} from "lucide-react"
import { professionalsService, type ProfessionalProfile } from "@/lib/firestore-service"
import { ReviewsDisplay } from "@/components/reviews-display"
import { Header } from "@/components/header"

const DISTRICTS = [
  "All Districts",
  "Kohima",
  "Dimapur",
  "Mokokchung",
  "Tuensang",
  "Mon",
  "Wokha",
  "Zunheboto",
  "Phek",
  "Kiphire",
  "Longleng",
  "Peren",
]

export default function ProfessionalsPage() {
  // All hooks must be called at the top level
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // State for professionals data
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<ProfessionalProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  // State for filters and professions
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfession, setSelectedProfession] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All Districts")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [professions, setProfessions] = useState<string[]>([])
  const [loadingProfessions, setLoadingProfessions] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/professionals')
    }
  }, [user, authLoading, router])

  // Load professions and professionals when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load professions first
        const professionsList = await professionalsService.getUniqueProfessions()
        setProfessions(professionsList)
        
        // Then load professionals
        await loadProfessionals()
      } catch (error) {
        console.error("Error loading initial data:", error)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoadingProfessions(false)
      }
    }
    
    loadInitialData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [professionals, searchTerm, selectedProfession, selectedLocation, verifiedOnly, minRating])

  const loadProfessionals = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await professionalsService.getProfessionals()
      setProfessionals(data)
    } catch (error: any) {
      setError("Failed to load professionals. Please try again.")
      console.error("Error loading professionals:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...professionals]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (prof) =>
          prof.name.toLowerCase().includes(term) ||
          prof.profession.toLowerCase().includes(term) ||
          prof.skills.some((skill) => skill.toLowerCase().includes(term)) ||
          prof.description.toLowerCase().includes(term),
      )
    }

    // Profession filter
    if (selectedProfession !== "All") {
      filtered = filtered.filter((prof) => prof.profession === selectedProfession)
    }

    // Location filter
    if (selectedLocation !== "All Districts") {
      filtered = filtered.filter((prof) => prof.location === selectedLocation)
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter((prof) => prof.verified)
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((prof) => prof.rating >= minRating)
    }

    setFilteredProfessionals(filtered)
  }

  const handleViewProfile = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional)
    setShowProfileModal(true)
  }

  const formatResponseTime = (responseTime: string) => {
    return responseTime.replace("_", " ")
  }

  // Render loading state if checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render main content
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Professionals</h1>
          <p className="text-gray-600">Discover talented professionals in Nagaland ready to help with your projects</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Name, skills, profession..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Profession */}
              <div className="space-y-2">
                <Label>Profession</Label>
                <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProfessions ? "Loading..." : "Select profession"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProfessions ? (
                      <div className="p-2 text-sm text-gray-500">Loading professions...</div>
                    ) : (
                      professions.map((profession) => (
                        <SelectItem key={profession} value={profession}>
                          {profession}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="verified"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <Label htmlFor="verified" className="text-sm font-medium">
                Verified professionals only
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredProfessionals.length} of {professionals.length} professionals
          </p>
        </div>

        {filteredProfessionals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold">{professional.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{professional.name}</CardTitle>
                      <p className="text-sm text-gray-600">{professional.profession}</p>
                    </div>
                  </div>
                  {professional.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating and Reviews */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(professional.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{professional.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-600">({professional.reviews} reviews)</span>
                </div>

                {/* Location and Rate */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {professional.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {professional.hourlyRate}
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {professional.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {professional.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{professional.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span>{professional.completedJobs} jobs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatResponseTime(professional.responseTime)}</span>
                  </div>
                </div>

                {/* Languages */}
                {professional.languages.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Languages className="w-4 h-4" />
                    <span>{professional.languages.join(", ")}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-700 line-clamp-2">{professional.description}</p>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleViewProfile(professional)} className="flex-1">
                    View Profile
                  </Button>
                  <Button variant="outline" size="icon">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProfessional && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold">{selectedProfessional.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProfessional.name}</h2>
                    <p className="text-lg text-gray-600">{selectedProfessional.profession}</p>
                  </div>
                  {selectedProfessional.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>Professional profile and reviews</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>{selectedProfessional.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <span>{selectedProfessional.hourlyRate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span>{formatResponseTime(selectedProfessional.responseTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gray-400" />
                        <span>{selectedProfessional.completedJobs} completed jobs</span>
                      </div>
                    </div>

                    {selectedProfessional.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Languages className="w-5 h-5 text-gray-400" />
                        <span>{selectedProfessional.languages.join(", ")}</span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfessional.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-gray-700">{selectedProfessional.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewsDisplay professional={selectedProfessional} />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
