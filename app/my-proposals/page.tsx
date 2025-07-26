"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Clock, DollarSign, MapPin, CheckCircle, XCircle, AlertCircle, Briefcase } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { proposalsService, jobsService, type Proposal, type Job } from "@/lib/firestore-service"
import { Header } from "@/components/header"

interface ProposalWithJob extends Proposal {
  job?: Job
}

export default function MyProposalsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [proposals, setProposals] = useState<ProposalWithJob[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")

  const isProfessional = userProfile?.userType === "professional" || userProfile?.userType === "both"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (!loading && !isProfessional) {
      router.push("/dashboard")
      return
    }

    if (user && isProfessional) {
      loadProposals()
    }
  }, [user, userProfile, loading])

  const loadProposals = async () => {
    try {
      setPageLoading(true)
      setError("")

      // Load proposals by this professional
      const proposalsData = await proposalsService.getProposalsByProfessional(user!.uid)

      // Load job details for each proposal
      const proposalsWithJobs = await Promise.all(
        proposalsData.map(async (proposal) => {
          try {
            const job = await jobsService.getJob(proposal.jobId)
            return {
              ...proposal,
              job,
            }
          } catch (error) {
            console.error("Error loading job details:", error)
            return proposal
          }
        }),
      )

      setProposals(proposalsWithJobs)
    } catch (error: any) {
      console.error("Error loading proposals:", error)
      setError("Failed to load proposals. Please try again.")
    } finally {
      setPageLoading(false)
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
            <p className="text-gray-600">Loading your proposals...</p>
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
              <Button onClick={loadProposals}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
          <p className="text-gray-600">Track your job applications and their status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingProposals.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{acceptedProposals.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{rejectedProposals.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals */}
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any proposals yet. Start browsing jobs to find opportunities!
              </p>
              <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({proposals.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingProposals.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedProposals.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedProposals.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingProposals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No pending proposals</p>
                  </CardContent>
                </Card>
              ) : (
                pendingProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
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
                acceptedProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
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
                rejectedProposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

interface ProposalCardProps {
  proposal: ProposalWithJob
}

function ProposalCard({ proposal }: ProposalCardProps) {
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{proposal.job?.title || "Job Title Not Available"}</h3>
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
            </div>
            {proposal.job && (
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {proposal.job.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {proposal.job.budget}
                </div>
                <Badge variant="outline" className="capitalize">
                  {proposal.job.category}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Submitted</div>
            <div className="text-sm font-medium">{formatDate(proposal.createdAt)}</div>
          </div>
        </div>

        {proposal.job && (
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Job Description:</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{proposal.job.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Your Proposed Budget</h4>
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              {proposal.proposedBudget}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Your Timeline</h4>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              {proposal.timeline}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Your Cover Letter</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{proposal.message}</p>
        </div>

        {proposal.job && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                    {getInitials(proposal.job.clientName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{proposal.job.clientName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>★ {proposal.job.clientRating || 0}</span>
                    <span>•</span>
                    <span>Client</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{proposal.job.proposals} total proposals</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
