"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  jobsService,
  proposalsService,
  professionalsService,
  type Job,
  type Proposal,
  type ProfessionalProfile,
} from "@/lib/firestore-service"
import { Header } from "@/components/header"

interface ProposalWithProfessional extends Proposal {
  professionalProfile?: ProfessionalProfile
}

export default function JobProposalsPage() {
  const { jobId } = useParams()
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [proposals, setProposals] = useState<ProposalWithProfessional[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingProposal, setUpdatingProposal] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user && jobId) {
      loadJobAndProposals()
    }
  }, [user, loading, jobId])

  const loadJobAndProposals = async () => {
    try {
      setPageLoading(true)
      setError("")

      // Validate jobId parameter
      if (!jobId || typeof jobId !== "string") {
        setError("Invalid job ID")
        return
      }

      // Load job details
      const jobData = await jobsService.getJob(jobId as string)
      if (!jobData) {
        setError("Job not found. It may have been deleted or you don't have permission to view it.")
        return
      }

      // Check if user owns this job
      if (jobData.clientId !== user?.uid) {
        setError("You don't have permission to view proposals for this job")
        return
      }

      setJob(jobData)

      // Load proposals for this job
      try {
        const proposalsData = await proposalsService.getProposalsForJob(jobId as string)

        // Load professional profiles for each proposal
        const proposalsWithProfiles = await Promise.all(
          proposalsData.map(async (proposal) => {
            try {
              const professionalProfile = await professionalsService.getProfessionalByUserId(proposal.professionalId)
              return {
                ...proposal,
                professionalProfile,
              }
            } catch (error) {
              console.error("Error loading professional profile:", error)
              return proposal
            }
          }),
        )

        setProposals(proposalsWithProfiles)
      } catch (proposalError) {
        console.error("Error loading proposals:", proposalError)
        // Set empty proposals array but don't fail the whole page
        setProposals([])
      }
    } catch (error: any) {
      console.error("Error loading job and proposals:", error)
      if (error.code === "permission-denied") {
        setError("You don't have permission to view this job or its proposals.")
      } else if (error.code === "not-found") {
        setError("Job not found. It may have been deleted.")
      } else {
        setError("Failed to load job details. Please try again.")
      }
    } finally {
      setPageLoading(false)
    }
  }

  const handleProposalAction = async (proposalId: string, action: "accepted" | "rejected") => {
    try {
      setUpdatingProposal(proposalId)
      await proposalsService.updateProposal(proposalId, { status: action })

      // If accepting, update job status to in_progress
      if (action === "accepted" && job) {
        await jobsService.updateJob(job.id!, { status: "in_progress" })
      }

      // Reload proposals
      await loadJobAndProposals()
    } catch (error: any) {
      console.error("Error updating proposal:", error)
      setError("Failed to update proposal. Please try again.")
    } finally {
      setUpdatingProposal(null)
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
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposals...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.back()}>Go Back</Button>
                <Button variant="outline" onClick={loadJobAndProposals}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  const pendingProposals = proposals.filter((p) => p.status === "pending")
  const acceptedProposals = proposals.filter((p) => p.status === "accepted")
  const rejectedProposals = proposals.filter((p) => p.status === "rejected")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposals for "{job.title}"</h1>
          <p className="text-gray-600">Review and manage proposals from professionals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="capitalize">
                      {job.category}
                    </Badge>
                    <Badge
                      className={job.urgency === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}
                    >
                      {job.urgency === "urgent" ? "Urgent" : "Normal"}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.budget}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.timeline}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Description:</h4>
                  <p className="text-sm text-gray-600">{job.description}</p>
                </div>

                {job.requirements && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Requirements:</h4>
                    <p className="text-sm text-gray-600">{job.requirements}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{proposals.length}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{pendingProposals.length}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{acceptedProposals.length}</div>
                      <div className="text-xs text-gray-500">Accepted</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proposals */}
          <div className="lg:col-span-2">
            {proposals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                  <p className="text-gray-600">Professionals haven't submitted any proposals for this job yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pendingProposals.length})</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted ({acceptedProposals.length})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejectedProposals.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {pendingProposals.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No pending proposals</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingProposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onAction={handleProposalAction}
                        isUpdating={updatingProposal === proposal.id}
                        showActions={job.status === "open"}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="accepted" className="space-y-4">
                  {acceptedProposals.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No accepted proposals</p>
                      </CardContent>
                    </Card>
                  ) : (
                    acceptedProposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onAction={handleProposalAction}
                        isUpdating={false}
                        showActions={false}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                  {rejectedProposals.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No rejected proposals</p>
                      </CardContent>
                    </Card>
                  ) : (
                    rejectedProposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        onAction={handleProposalAction}
                        isUpdating={false}
                        showActions={false}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProposalCardProps {
  proposal: ProposalWithProfessional
  onAction: (proposalId: string, action: "accepted" | "rejected") => void
  isUpdating: boolean
  showActions: boolean
}

function ProposalCard({ proposal, onAction, isUpdating, showActions }: ProposalCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                {getInitials(proposal.professionalName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{proposal.professionalName}</h3>
              {proposal.professionalProfile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{proposal.professionalProfile.profession}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{proposal.professionalProfile.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{proposal.professionalProfile.completedJobs} jobs</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(proposal.status)}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
            <span className="text-sm text-gray-500">{formatDate(proposal.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Proposed Budget</h4>
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              {proposal.proposedBudget}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Timeline</h4>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              {proposal.timeline}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Cover Letter</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{proposal.message}</p>
        </div>

        {proposal.professionalProfile && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Professional Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Location: {proposal.professionalProfile.location}</div>
              <div>Response Time: {proposal.professionalProfile.responseTime}</div>
              <div>Languages: {proposal.professionalProfile.languages.join(", ")}</div>
              <div>Hourly Rate: {proposal.professionalProfile.hourlyRate || "Not set"}</div>
            </div>
            {proposal.professionalProfile.skills.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-gray-700">Skills: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {proposal.professionalProfile.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showActions && proposal.status === "pending" && (
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => onAction(proposal.id!, "accepted")} disabled={isUpdating} className="flex-1">
              {isUpdating ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Proposal
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction(proposal.id!, "rejected")}
              disabled={isUpdating}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
