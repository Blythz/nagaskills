"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Users, Briefcase, Shield } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { useState } from "react"
import { useRouter } from "next/navigation"

const categories = [
  { name: "Carpenter", icon: "🔨", count: 45 },
  { name: "Mason", icon: "🧱", count: 32 },
  { name: "Plumber", icon: "🔧", count: 28 },
  { name: "Teacher", icon: "📚", count: 67 },
  { name: "Writer", icon: "✍️", count: 23 },
  { name: "Shopkeeper", icon: "🏪", count: 89 },
  { name: "Electrician", icon: "⚡", count: 34 },
  { name: "Driver", icon: "🚗", count: 56 },
]

const featuredProfessionals = [
  {
    name: "Temjen Longkumer",
    profession: "Carpenter",
    location: "Dimapur",
    rating: 4.9,
    reviews: 127,
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    name: "Merenla Jamir",
    profession: "Teacher (English)",
    location: "Kohima",
    rating: 4.8,
    reviews: 89,
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    name: "Chubatoshi Ao",
    profession: "Mason",
    location: "Mokokchung",
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    // Create search parameters
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
    if (location.trim()) {
      params.set('location', location.trim())
    }
    
    // Navigate to search results page that shows both jobs and professionals
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Local Professionals in <span className="text-green-600">Nagaland</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with skilled carpenters, masons, teachers, writers, and more. Supporting local talent across all
            districts of Nagaland.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-lg shadow-lg border">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="What service do you need?"
                  className="border-0 focus-visible:ring-0 text-lg w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="flex items-center gap-2 px-3 md:border-l">
                <MapPin className="w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="District" 
                  className="border-0 focus-visible:ring-0 w-full md:w-32"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto">
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg mx-auto mb-2 md:mb-3">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm md:text-base text-gray-600">Verified Professionals</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg mx-auto mb-2 md:mb-3">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">1,200+</div>
              <div className="text-sm md:text-base text-gray-600">Jobs Completed</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm sm:col-span-1 sm:mx-auto sm:max-w-xs">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg mx-auto mb-2 md:mb-3">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm md:text-base text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Popular Categories</h2>
            <p className="text-gray-600 text-sm md:text-base">Find the right professional for your needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105">
                <CardContent className="p-3 md:p-6 text-center">
                  <div className="text-2xl md:text-4xl mb-2 md:mb-3">{category.icon}</div>
                  <h3 className="font-semibold mb-1 text-sm md:text-base">{category.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{category.count} professionals</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-12">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View All Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-12 md:py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Top Rated Professionals</h2>
            <p className="text-gray-600 text-sm md:text-base">Connect with verified experts in your area</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {featuredProfessionals.map((professional) => (
              <Card key={professional.name} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={professional.image || "/placeholder.svg"}
                        alt={professional.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                      />
                      {professional.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base md:text-lg truncate">{professional.name}</h3>
                      <p className="text-gray-600 text-sm md:text-base truncate">{professional.profession}</p>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{professional.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm md:text-base">{professional.rating}</span>
                      <span className="text-gray-500 text-xs md:text-sm">({professional.reviews})</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-12">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View All Professionals
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">How It Works</h2>
            <p className="text-gray-600 text-sm md:text-base">Simple steps to get your job done</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-green-50 to-white">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Post Your Job</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Describe what you need done with our spam-prevention system ensuring quality posts.
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-blue-50 to-white">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Get Proposals</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Receive proposals from verified local professionals with ratings and reviews.
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-purple-50 to-white sm:col-span-1 sm:mx-auto sm:max-w-xs">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-lg md:text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Complete & Review</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Work gets done, you pay securely, and leave a review to help the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">Join thousands of satisfied customers and professionals in Nagaland</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <Link href="/post-job">Post a Job</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent w-full sm:w-auto"
              asChild
            >
              <Link href="/register">Join as Professional</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                  NF
                </div>
                <span className="text-lg md:text-xl font-bold">NagaFreelance</span>
              </div>
              <p className="text-gray-400 text-sm md:text-base">Connecting local talent across Nagaland</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">For Clients</h3>
              <ul className="space-y-1 md:space-y-2 text-gray-400 text-sm md:text-base">
                <li>
                  <Link href="/post-job" className="hover:text-white transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/professionals" className="hover:text-white transition-colors">
                    Find Professionals
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">For Professionals</h3>
              <ul className="space-y-1 md:space-y-2 text-gray-400 text-sm md:text-base">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Join as Professional
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/success-stories" className="hover:text-white transition-colors">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Support</h3>
              <ul className="space-y-1 md:space-y-2 text-gray-400 text-sm md:text-base">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white transition-colors">
                    Safety
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-sm md:text-base">&copy; 2024 NagaFreelance. Made with ❤️ for Nagaland</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
