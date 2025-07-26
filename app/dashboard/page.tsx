"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Users, Star, Calendar, MapPin, DollarSign, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { jobsService, professionalsService, type Job, type ProfessionalProfile } from "@/lib/firestore-service"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { Header } from "@/components/header"

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [userJobs, setUserJobs] = useState<Job[]>([])
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState("")

  const isClient = userProfile?.userType === "client" || userProfile?.userType === "both"
  const isProfessional = userProfile?.userType === "professional" || userProfile?.userType === "both"

  useEffect(() => {
    const success = searchParams.get("success")
    if (success) {
      setSuccessMessage(success)
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user && userProfile) {
      loadDashboardData()
    }
  }, [user, userProfile, loading])

  const loadDashboardData = async () => {
    if (!user || !userProfile) return

    try {
      if (isClient) {
        // Load jobs posted by client using the simplified method
        try {
          const jobs = await jobsService.getJobsByClientId(user.uid)
          setUserJobs(jobs)
        } catch (jobError) {
          console.error("Error loading jobs:", jobError)
          // Set empty array as fallback
          setUserJobs([])
        }
      }

      if (isProfessional) {
        // Load professional profile
        try {
          const profile = await professionalsService.getProfessionalByUserId(user.uid)
          setProfessionalProfile(profile)
        } catch (profileError) {
          console.error("Error loading professional profile:", profileError)
          // Set null as fallback
          setProfessionalProfile(null)
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setDashboardLoading(false)
    }
  }

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userProfile.displayName}!</h1>
          <p className="text-gray-600">
            {userProfile.userType === "client"
              ? "Manage your job posts and find professionals"
              : userProfile.userType === "professional"
                ? "Track your jobs and grow your business"
                : "Manage your job posts, find professionals, and grow your business"}
          </p>
        </div>

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {isClient ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userJobs.filter((job) => job.status === "open").length}
                      </p>
                    </div>
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{userJobs.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userJobs.filter((job) => job.status === "completed").length}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userJobs.reduce((sum, job) => sum + job.proposals, 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalProfile?.rating || 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalProfile?.completedJobs || 0}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalProfile?.reviews || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalProfile?.hourlyRate || "Not set"}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs
          defaultValue={userProfile.userType === "both" ? "jobs" : isClient ? "jobs" : "available-jobs"}
          className="space-y-6"
        >
          <TabsList>
            {isClient && (
              <>
                <TabsTrigger value="jobs">My Jobs</TabsTrigger>
                <TabsTrigger value="post-job">Post New Job</TabsTrigger>
              </>
            )}
            {isProfessional && (
              <>
                <TabsTrigger value="available-jobs">Available Jobs</TabsTrigger>
                <TabsTrigger value="my-proposals">My Proposals</TabsTrigger>
                <TabsTrigger value="profile">Professional Profile</TabsTrigger>
              </>
            )}
          </TabsList>

          {isClient ? (
            <>
              <TabsContent value="jobs" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Job Posts</h2>
                  <Button asChild>
                    <Link href="/post-job">
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Job
                    </Link>
                  </Button>
                </div>

                {userJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                      <p className="text-gray-600 mb-4">Start by posting your first job to find professionals</p>
                      <Button asChild>
                        <Link href="/post-job">Post Your First Job</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {userJobs.map((job) => (
                      <Card key={job.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
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
                              <Badge variant="outline">{job.category}</Badge>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{job.proposals} proposals received</span>
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
              </TabsContent>

              <TabsContent value="post-job">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to post a job?</h3>
                    <p className="text-gray-600 mb-4">Find the perfect professional for your project</p>
                    <Button asChild>
                      <Link href="/post-job">Go to Job Posting Form</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="available-jobs">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Find Jobs</h3>
                    <p className="text-gray-600 mb-4">Browse available jobs that match your skills</p>
                    <Button asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-proposals">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your Proposals</h3>
                    <p className="text-gray-600 mb-4">Track your job applications and proposals</p>
                    <Button asChild>
                      <Link href="/my-proposals">View My Proposals</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Professional Profile</h3>
                    <p className="text-gray-600 mb-4">Manage your professional profile and portfolio</p>
                    <Button variant="outline">Edit Profile</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
