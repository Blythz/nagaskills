"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Briefcase, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data - replace with actual API calls
const mockProfessionals = [
  {
    id: "1",
    name: "Temjen Longkumer",
    profession: "Carpenter",
    location: "Dimapur",
    rating: 4.9,
    reviews: 127,
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
    description: "Expert carpenter with 10+ years experience in furniture making and home repairs",
    price: "₹500-₹2000",
  },
  {
    id: "2",
    name: "Merenla Jamir",
    profession: "Teacher (English)",
    location: "Kohima",
    rating: 4.8,
    reviews: 89,
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
    description: "Experienced English teacher for classes 6-12, specializing in grammar and literature",
    price: "₹300-₹800/hour",
  },
  {
    id: "3",
    name: "Chubatoshi Ao",
    profession: "Mason",
    location: "Mokokchung",
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
    description: "Skilled mason for construction, renovation, and repair work",
    price: "₹800-₹2500/day",
  },
]

const mockJobs = [
  {
    id: "1",
    title: "Need Carpenter for Furniture Repair",
    description: "Looking for an experienced carpenter to repair and polish old wooden furniture. 3 chairs and 1 table need attention.",
    location: "Dimapur",
    budget: "₹1500-₹3000",
    category: "Carpenter",
    posted: "2 days ago",
    proposals: 5,
  },
  {
    id: "2",
    title: "English Tutor Required",
    description: "Need a qualified English teacher for my daughter studying in class 10. 3 days a week, 2 hours per session.",
    location: "Kohima",
    budget: "₹500-₹800/hour",
    category: "Teacher",
    posted: "1 day ago",
    proposals: 8,
  },
  {
    id: "3",
    title: "Mason for House Construction",
    description: "Looking for experienced masons for construction of a small house. Foundation and walls work needed.",
    location: "Mokokchung",
    budget: "₹2000-₹4000/day",
    category: "Mason",
    posted: "3 days ago",
    proposals: 3,
  },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''

  // Filter professionals based on search
  const filteredProfessionals = mockProfessionals.filter(prof => 
    prof.profession.toLowerCase().includes(query.toLowerCase()) &&
    prof.location.toLowerCase().includes(location.toLowerCase())
  )

  // Filter jobs based on search
  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(query.toLowerCase()) ||
    job.category.toLowerCase().includes(query.toLowerCase()) &&
    job.location.toLowerCase().includes(location.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-600">
            {query || location ? (
              <>Showing results for: <span className="font-semibold">{query || 'All services'}</span>
              {location && <> in <span className="font-semibold">{location}</span></>}</>
            ) : (
              "Showing all available services"
            )}
          </p>
        </div>

        <Tabs defaultValue="professionals" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="professionals">
              Professionals ({filteredProfessionals.length})
            </TabsTrigger>
            <TabsTrigger value="jobs">
              Jobs ({filteredJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((professional) => (
                <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={professional.image}
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-gray-600">{professional.profession}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {professional.location}
                        </div>
                      </div>
                      {professional.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{professional.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{professional.rating}</span>
                        <span className="text-gray-500 text-sm">({professional.reviews} reviews)</span>
                      </div>
                      <span className="font-semibold text-green-600">{professional.price}</span>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <Link href={`/professionals/${professional.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredProfessionals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No professionals found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                          <span>•</span>
                          <span>{job.category}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{job.proposals} proposals</Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{job.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{job.budget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {job.posted}
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No jobs found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
