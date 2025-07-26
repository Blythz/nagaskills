"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, AlertCircle, CheckCircle } from "lucide-react"
import { reviewsService, type ProfessionalProfile } from "@/lib/firestore-service"
import { useAuth } from "@/lib/auth-context"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  professional: ProfessionalProfile
  onReviewSubmitted?: () => void
}

export function ReviewModal({ isOpen, onClose, professional, onReviewSubmitted }: ReviewModalProps) {
  const { user, userProfile } = useAuth()
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    workQuality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
    wouldRecommend: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleRatingChange = (field: string, rating: number) => {
    setFormData((prev) => ({ ...prev, [field]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!user || !userProfile) {
      setError("You must be logged in to submit a review")
      return
    }

    if (formData.rating === 0) {
      setError("Please provide an overall rating")
      return
    }

    if (
      formData.workQuality === 0 ||
      formData.communication === 0 ||
      formData.timeliness === 0 ||
      formData.professionalism === 0
    ) {
      setError("Please rate all aspects of the service")
      return
    }

    if (!formData.comment.trim()) {
      setError("Please provide a comment about your experience")
      return
    }

    setSubmitting(true)

    try {
      // Check if user can review this professional
      const canReview = await reviewsService.canClientReviewProfessional(user.uid, professional.id!)
      if (!canReview) {
        setError("You can only review professionals you have worked with")
        return
      }

      // Check if user has already reviewed this professional
      const hasReviewed = await reviewsService.hasClientReviewedProfessional(user.uid, professional.id!)
      if (hasReviewed) {
        setError("You have already reviewed this professional")
        return
      }

      await reviewsService.createReview({
        professionalId: professional.id!,
        professionalName: professional.name,
        clientId: user.uid,
        clientName: userProfile.displayName || user.displayName || "Anonymous",
        rating: formData.rating,
        comment: formData.comment.trim(),
        workQuality: formData.workQuality,
        communication: formData.communication,
        timeliness: formData.timeliness,
        professionalism: formData.professionalism,
        wouldRecommend: formData.wouldRecommend,
      })

      setSuccess("Review submitted successfully!")

      // Reset form
      setFormData({
        rating: 0,
        comment: "",
        workQuality: 0,
        communication: 0,
        timeliness: 0,
        professionalism: 0,
        wouldRecommend: false,
      })

      // Call callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        setSuccess("")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({
    rating,
    onRatingChange,
    label,
  }: {
    rating: number
    onRatingChange: (rating: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review {professional.name}</DialogTitle>
          <DialogDescription>
            Share your experience working with this professional to help others make informed decisions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange("rating", star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StarRating
              rating={formData.workQuality}
              onRatingChange={(rating) => handleRatingChange("workQuality", rating)}
              label="Work Quality *"
            />
            <StarRating
              rating={formData.communication}
              onRatingChange={(rating) => handleRatingChange("communication", rating)}
              label="Communication *"
            />
            <StarRating
              rating={formData.timeliness}
              onRatingChange={(rating) => handleRatingChange("timeliness", rating)}
              label="Timeliness *"
            />
            <StarRating
              rating={formData.professionalism}
              onRatingChange={(rating) => handleRatingChange("professionalism", rating)}
              label="Professionalism *"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold">
              Your Experience *
            </Label>
            <Textarea
              id="comment"
              placeholder="Describe your experience working with this professional..."
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              rows={4}
              required
            />
          </div>

          {/* Would Recommend */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="wouldRecommend"
              checked={formData.wouldRecommend}
              onChange={(e) => setFormData((prev) => ({ ...prev, wouldRecommend: e.target.checked }))}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <Label htmlFor="wouldRecommend" className="text-sm font-medium">
              I would recommend this professional to others
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
