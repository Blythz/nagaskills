"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, ThumbsUp, Calendar, AlertCircle } from "lucide-react"
import { reviewsService, type Review, type ProfessionalProfile } from "@/lib/firestore-service"
import { useAuth } from "@/lib/auth-context"
import { ReviewModal } from "./review-modal"

interface ReviewsDisplayProps {
  professional: ProfessionalProfile
}

export function ReviewsDisplay({ professional }: ReviewsDisplayProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    loadReviews()
    checkReviewPermissions()
  }, [professional.id, user])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const reviewsData = await reviewsService.getReviewsForProfessional(professional.id!)
      setReviews(reviewsData)
    } catch (error: any) {
      setError("Failed to load reviews")
      console.error("Error loading reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkReviewPermissions = async () => {
    if (!user || !professional.id) return

    try {
      const [canReviewResult, hasReviewedResult] = await Promise.all([
        reviewsService.canClientReviewProfessional(user.uid, professional.id),
        reviewsService.hasClientReviewedProfessional(user.uid, professional.id),
      ])

      setCanReview(canReviewResult)
      setHasReviewed(hasReviewedResult)
    } catch (error) {
      console.error("Error checking review permissions:", error)
    }
  }

  const handleReviewSubmitted = () => {
    loadReviews()
    checkReviewPermissions()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getReviewStats = () => {
    if (reviews.length === 0) return null

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    const recommendationRate = (reviews.filter((r) => r.wouldRecommend).length / totalReviews) * 100

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
      percentage: (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100,
    }))

    const averageScores = {
      workQuality: reviews.reduce((sum, r) => sum + r.workQuality, 0) / totalReviews,
      communication: reviews.reduce((sum, r) => sum + r.communication, 0) / totalReviews,
      timeliness: reviews.reduce((sum, r) => sum + r.timeliness, 0) / totalReviews,
      professionalism: reviews.reduce((sum, r) => sum + r.professionalism, 0) / totalReviews,
    }

    return {
      totalReviews,
      averageRating,
      recommendationRate,
      ratingDistribution,
      averageScores,
    }
  }

  const stats = getReviewStats()
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviews ({reviews.length})</CardTitle>
          {user && canReview && !hasReviewed && <Button onClick={() => setShowReviewModal(true)}>Write Review</Button>}
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reviews yet</p>
              <p className="text-sm">Be the first to review this professional!</p>
            </div>
          ) : (
            <>
              {/* Review Statistics */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Overall Rating */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
                      <div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(stats.averageRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{stats.totalReviews} reviews</p>
                      </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                      {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                          <span className="w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-8 text-gray-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Service Breakdown</h4>
                    <div className="space-y-3">
                      {[
                        { key: "workQuality", label: "Work Quality" },
                        { key: "communication", label: "Communication" },
                        { key: "timeliness", label: "Timeliness" },
                        { key: "professionalism", label: "Professionalism" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{label}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(stats.averageScores[key as keyof typeof stats.averageScores])
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">
                              {stats.averageScores[key as keyof typeof stats.averageScores].toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendation Rate */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{Math.round(stats.recommendationRate)}%</span>
                        <span className="text-sm text-gray-600">would recommend</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Reviews */}
              <div className="space-y-4">
                <h4 className="font-semibold">Recent Reviews</h4>
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{review.clientName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{review.clientName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.wouldRecommend && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Recommends
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-700">{review.comment}</p>

                    {review.jobTitle && (
                      <p className="text-sm text-gray-500">
                        Project: <span className="font-medium">{review.jobTitle}</span>
                      </p>
                    )}

                    {/* Detailed ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t text-sm">
                      <div>
                        <span className="text-gray-600">Quality:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.workQuality ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Communication:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.communication ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Timeliness:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.timeliness ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Professional:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.professionalism ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {reviews.length > 3 && (
                  <Button variant="outline" onClick={() => setShowAllReviews(!showAllReviews)} className="w-full">
                    {showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        professional={professional}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  )
}
