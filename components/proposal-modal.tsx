"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, DollarSign, Calendar, Send, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { proposalsService, professionalsService, type Job } from "@/lib/firestore-service"

interface ProposalModalProps {
  job: Job
  onProposalSubmitted?: () => void
}

export function ProposalModal({ job, onProposalSubmitted }: ProposalModalProps) {
  const { user, userProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    message: "",
    proposedBudget: "",
    timeline: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const isProfessional = userProfile?.userType === "professional" || userProfile?.userType === "both"

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    if (!user || !userProfile || !isProfessional) {
      setError("You must be logged in as a professional to submit proposals")
      setSubmitting(false)
      return
    }

    if (!formData.message.trim() || !formData.proposedBudget.trim() || !formData.timeline.trim()) {
      setError("Please fill in all required fields")
      setSubmitting(false)
      return
    }

    try {
      // Get professional profile to get the name
      const professionalProfile = await professionalsService.getProfessionalByUserId(user.uid)
      const professionalName = professionalProfile?.name || userProfile.displayName || "Unknown Professional"

      const proposalData = {
        jobId: job.id!,
        professionalId: user.uid,
        professionalName,
        message: formData.message.trim(),
        proposedBudget: formData.proposedBudget.trim(),
        timeline: formData.timeline.trim(),
        status: "pending" as const,
      }

      await proposalsService.createProposal(proposalData)

      setSuccess(true)
      setFormData({ message: "", proposedBudget: "", timeline: "" })

      // Close modal after 2 seconds and call callback
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        onProposalSubmitted?.()
      }, 2000)
    } catch (error: any) {
      console.error("Error submitting proposal:", error)
      setError(error.message || "Failed to submit proposal. Please try again.")
    } finally {
      setSubmitting(false)
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

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Submit Proposal</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>You need to sign in to submit proposals for jobs.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => (window.location.href = "/register")}>
              Sign Up
            </Button>
            <Button onClick={() => (window.location.href = "/login")}>Sign In</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!isProfessional) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Submit Proposal</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Professional Account Required</DialogTitle>
            <DialogDescription>
              You need to have a professional account to submit proposals. You can upgrade your account in settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => (window.location.href = "/settings")}>Go to Settings</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={job.status !== "open"}>{job.status === "open" ? "Submit Proposal" : "Not Available"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Proposal</DialogTitle>
          <DialogDescription>Submit your proposal for this job opportunity</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      className={job.urgency === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}
                    >
                      {job.urgency === "urgent" ? "Urgent" : "Normal"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {job.category}
                    </Badge>
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

                {job.timeline && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Timeline:</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {job.timeline}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
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
              </CardContent>
            </Card>
          </div>

          {/* Proposal Form */}
          <div className="space-y-4">
            {success ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Proposal Submitted!</h3>
                  <p className="text-green-700">
                    Your proposal has been sent to the client. You'll be notified when they respond.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Proposal</CardTitle>
                  <CardDescription>Provide details about how you'll complete this job</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="message">Cover Letter *</Label>
                      <Textarea
                        id="message"
                        placeholder="Explain why you're the right person for this job. Include your relevant experience and approach..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-500">Tip: Mention specific experience related to this job type</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposedBudget">Your Proposed Budget *</Label>
                      <Input
                        id="proposedBudget"
                        placeholder="e.g., ₹15,000 or ₹500/day"
                        value={formData.proposedBudget}
                        onChange={(e) => handleInputChange("proposedBudget", e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-500">Client's budget: {job.budget}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeline">Your Timeline *</Label>
                      <Input
                        id="timeline"
                        placeholder="e.g., 5 days, 2 weeks"
                        value={formData.timeline}
                        onChange={(e) => handleInputChange("timeline", e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-500">Client's timeline: {job.timeline}</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Proposal
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
