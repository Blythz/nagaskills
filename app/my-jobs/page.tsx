"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, DollarSign, Users, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { jobsService, type Job } from "@/lib/firestore-service"
import Link from "next/link"
import { Header } from "@/components/header"

export default function MyJobsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")

  const isClient = userProfile?.userType === "client" || userProfile?.userType === "both"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (!loading && !isClient) {
      router.push("/dashboard")
      return
    }

    if (user && isClient) {
      loadJobs()
    }
  }, [user, userProfile, loading])

  const loadJobs = async () => {
    try {
      setPageLoading(true)
      setError("")
      const jobsData = await jobsService.getJobsByClientId(user!.uid)
      setJobs(jobsData)
    } catch (error: any) {
      console.error("Error loading jobs:", error)
      setError("Failed to load your jobs. Please try again.")
    } finally {
      setPageLoading(false)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isClient) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
              <p className="text-gray-600">Manage your job posts and view proposals</p>
            </div>
            <Button asChild>
              <Link href="/post-job">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Link>
            </Button>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">Start by posting your first job to find professionals</p>
              <Button asChild>
                <Link href="/post-job">Post Your First Job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {job.createdAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.budget}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          job.status === "open"
                            ? "bg-green-100 text-green-800"
                            : job.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {job.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {job.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{job.proposals} proposals received</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/my-jobs/${job.id}/proposals`}>View Proposals ({job.proposals})</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Job
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
