import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
} from "firebase/firestore"
import { db } from "./firebase"
import { notificationsService } from "./notifications-service"

// Job interface
export interface Job {
  id?: string
  title: string
  category: string
  description: string
  location: string
  budget: string
  timeline: string
  requirements: string
  contactMethod: string
  urgency: "normal" | "urgent"
  status: "open" | "in_progress" | "completed" | "cancelled"
  clientId: string
  clientName: string
  clientRating?: number
  proposals: number
  createdAt: Date
  updatedAt: Date
}

// Professional Profile interface
export interface ProfessionalProfile {
  id?: string
  userId: string
  name: string
  profession: string
  location: string
  rating: number
  reviews: number
  completedJobs: number
  hourlyRate: string
  skills: string[]
  description: string
  responseTime: string
  languages: string[]
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// Proposal interface
export interface Proposal {
  id?: string
  jobId: string
  professionalId: string
  professionalName: string
  message: string
  proposedBudget: string
  timeline: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}

// Review interface
export interface Review {
  id?: string
  professionalId: string
  professionalName: string
  clientId: string
  clientName: string
  jobId?: string
  jobTitle?: string
  rating: number
  comment: string
  workQuality: number
  communication: number
  timeliness: number
  professionalism: number
  wouldRecommend: boolean
  createdAt: Date
  updatedAt: Date
}

// Helper function to safely convert Firestore timestamps to dates
const convertTimestampToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date()
  }

  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp
  }

  // If it's a Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate()
  }

  // If it's a timestamp object with seconds
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000)
  }

  // If it's a string or number, try to parse it
  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? new Date() : date
  }

  // Fallback to current date
  return new Date()
}

// Jobs service
export const jobsService = {
  // Create a new job
  async createJob(jobData: Omit<Job, "id" | "createdAt" | "updatedAt" | "proposals">): Promise<string> {
    const job = {
      ...jobData,
      proposals: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    const docRef = await addDoc(collection(db, "jobs"), job)

    // Create notification for job posted
    try {
      await notificationsService.createJobPostedNotification(jobData.clientId, jobData.title, docRef.id)
    } catch (error) {
      console.error("Error creating job posted notification:", error)
    }

    return docRef.id
  },

  // Get all jobs with optional filters
  async getJobs(filters?: {
    category?: string
    location?: string
    status?: string
    clientId?: string
  }): Promise<Job[]> {
    try {
      let q = query(collection(db, "jobs"))

      // Apply filters first, then sort
      if (filters?.category && filters.category !== "All") {
        q = query(q, where("category", "==", filters.category))
      }
      if (filters?.location && filters.location !== "All Districts") {
        q = query(q, where("location", "==", filters.location))
      }
      if (filters?.status) {
        q = query(q, where("status", "==", filters.status))
      }
      if (filters?.clientId) {
        q = query(q, where("clientId", "==", filters.clientId))
      }

      // Only add orderBy if no specific clientId filter (to avoid composite index requirement)
      if (!filters?.clientId) {
        q = query(q, orderBy("createdAt", "desc"))
      }

      const querySnapshot = await getDocs(q)
      const jobs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Job
      })

      // If we filtered by clientId, sort manually to avoid index requirement
      if (filters?.clientId) {
        jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      return jobs
    } catch (error) {
      console.error("Error in getJobs:", error)
      throw error
    }
  },

  // Get jobs by client ID (simplified to avoid index requirements)
  async getJobsByClientId(clientId: string): Promise<Job[]> {
    try {
      const q = query(collection(db, "jobs"), where("clientId", "==", clientId))

      const querySnapshot = await getDocs(q)
      const jobs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Job
      })

      // Sort manually by creation date (newest first)
      return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error in getJobsByClientId:", error)
      throw error
    }
  },

  // Get a single job
  async getJob(jobId: string): Promise<Job | null> {
    try {
      const docRef = doc(db, "jobs", jobId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Job
      }
      return null
    } catch (error) {
      console.error("Error in getJob:", error)
      throw error
    }
  },

  // Update job
  async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    const docRef = doc(db, "jobs", jobId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Delete job
  async deleteJob(jobId: string): Promise<void> {
    await deleteDoc(doc(db, "jobs", jobId))
  },
}

// Professionals service
export const professionalsService = {
  // Create professional profile
  async createProfile(profileData: Omit<ProfessionalProfile, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const profile = {
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    const docRef = await addDoc(collection(db, "professionals"), profile)
    return docRef.id
  },

  // Get all professionals with optional filters
  async getProfessionals(filters?: {
    profession?: string
    location?: string
    verified?: boolean
  }): Promise<ProfessionalProfile[]> {
    try {
      let q = query(collection(db, "professionals"), orderBy("rating", "desc"))

      if (filters?.profession && filters.profession !== "All") {
        q = query(q, where("profession", "==", filters.profession))
      }
      if (filters?.location && filters.location !== "All Districts") {
        q = query(q, where("location", "==", filters.location))
      }
      if (filters?.verified !== undefined) {
        q = query(q, where("verified", "==", filters.verified))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as ProfessionalProfile
      })
    } catch (error) {
      console.error("Error in getProfessionals:", error)
      throw error
    }
  },

  // Get professional by user ID
  async getProfessionalByUserId(userId: string): Promise<ProfessionalProfile | null> {
    try {
      const q = query(collection(db, "professionals"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as ProfessionalProfile
      }
      return null
    } catch (error) {
      console.error("Error in getProfessionalByUserId:", error)
      throw error
    }
  },

  // Update professional profile
  async updateProfile(profileId: string, updates: Partial<ProfessionalProfile>): Promise<void> {
    const docRef = doc(db, "professionals", profileId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Recalculate professional rating based on reviews
  async updateProfessionalRating(professionalId: string): Promise<void> {
    try {
      const reviews = await reviewsService.getReviewsForProfessional(professionalId)

      if (reviews.length === 0) {
        await this.updateProfile(professionalId, { rating: 0, reviews: 0 })
        return
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = Math.round((totalRating / reviews.length) * 10) / 10 // Round to 1 decimal

      await this.updateProfile(professionalId, {
        rating: averageRating,
        reviews: reviews.length,
      })
    } catch (error) {
      console.error("Error updating professional rating:", error)
      throw error
    }
  },
}

// Proposals service
export const proposalsService = {
  // Create proposal
  async createProposal(proposalData: Omit<Proposal, "id" | "createdAt">): Promise<string> {
    const proposal = {
      ...proposalData,
      createdAt: Timestamp.now(),
    }
    const docRef = await addDoc(collection(db, "proposals"), proposal)

    // Increment proposal count on job
    const jobRef = doc(db, "jobs", proposalData.jobId)
    const jobDoc = await getDoc(jobRef)
    if (jobDoc.exists()) {
      const jobData = jobDoc.data() as Job
      await updateDoc(jobRef, {
        proposals: (jobData.proposals || 0) + 1,
      })

      // Create notification for client
      try {
        await notificationsService.createProposalReceivedNotification(
          jobData.clientId,
          jobData.title,
          proposalData.professionalName,
          proposalData.jobId,
          docRef.id,
        )
      } catch (error) {
        console.error("Error creating proposal notification:", error)
      }
    }

    return docRef.id
  },

  // Get proposals for a job
  async getProposalsForJob(jobId: string): Promise<Proposal[]> {
    try {
      // Remove orderBy to avoid composite index requirement
      const q = query(collection(db, "proposals"), where("jobId", "==", jobId))
      const querySnapshot = await getDocs(q)
      const proposals = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
        } as Proposal
      })

      // Sort manually by creation date (newest first)
      return proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error in getProposalsForJob:", error)
      throw error
    }
  },

  // Get proposals by professional
  async getProposalsByProfessional(professionalId: string): Promise<Proposal[]> {
    try {
      // Remove orderBy to avoid composite index requirement
      const q = query(collection(db, "proposals"), where("professionalId", "==", professionalId))
      const querySnapshot = await getDocs(q)
      const proposals = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
        } as Proposal
      })

      // Sort manually by creation date (newest first)
      return proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error in getProposalsByProfessional:", error)
      throw error
    }
  },

  // Update proposal status
  async updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<void> {
    const docRef = doc(db, "proposals", proposalId)
    await updateDoc(docRef, updates)

    // If status is being updated, create notification for professional
    if (updates.status && (updates.status === "accepted" || updates.status === "rejected")) {
      try {
        // Get the proposal to get professional and job info
        const proposalDoc = await getDoc(docRef)
        if (proposalDoc.exists()) {
          const proposalData = proposalDoc.data() as Proposal

          // Get job info
          const jobDoc = await getDoc(doc(db, "jobs", proposalData.jobId))
          if (jobDoc.exists()) {
            const jobData = jobDoc.data() as Job

            await notificationsService.createProposalStatusNotification(
              proposalData.professionalId,
              jobData.title,
              updates.status,
              proposalData.jobId,
              proposalId,
            )
          }
        }
      } catch (error) {
        console.error("Error creating proposal status notification:", error)
      }
    }
  },
}

// Reviews service
export const reviewsService = {
  // Create a review
  async createReview(reviewData: Omit<Review, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      return await runTransaction(db, async (transaction) => {
        // First, do all reads
        const professionalRef = doc(db, "professionals", reviewData.professionalId)
        const professionalDoc = await transaction.get(professionalRef)

        if (!professionalDoc.exists()) {
          throw new Error("Professional not found")
        }

        const professionalData = professionalDoc.data() as ProfessionalProfile
        const currentReviews = professionalData.reviews || 0
        const currentRating = professionalData.rating || 0

        // Calculate new average rating
        const newReviewCount = currentReviews + 1
        const newRating = (currentRating * currentReviews + reviewData.rating) / newReviewCount

        // Now do all writes
        const review = {
          ...reviewData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }

        const docRef = doc(collection(db, "reviews"))
        transaction.set(docRef, review)

        // Update professional's rating and review count
        transaction.update(professionalRef, {
          rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
          reviews: newReviewCount,
          updatedAt: Timestamp.now(),
        })

        return docRef.id
      })
    } catch (error) {
      console.error("Error creating review:", error)
      throw error
    }
  },

  // Get reviews for a professional
  async getReviewsForProfessional(professionalId: string): Promise<Review[]> {
    try {
      const q = query(collection(db, "reviews"), where("professionalId", "==", professionalId))
      const querySnapshot = await getDocs(q)
      const reviews = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Review
      })

      // Sort manually by creation date (newest first)
      return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error getting reviews for professional:", error)
      throw error
    }
  },

  // Get reviews by client
  async getReviewsByClient(clientId: string): Promise<Review[]> {
    try {
      const q = query(collection(db, "reviews"), where("clientId", "==", clientId))
      const querySnapshot = await getDocs(q)
      const reviews = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
          updatedAt: convertTimestampToDate(data.updatedAt),
        } as Review
      })

      // Sort manually by creation date (newest first)
      return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error getting reviews by client:", error)
      throw error
    }
  },

  // Check if client can review professional (has worked together)
  async canClientReviewProfessional(clientId: string, professionalId: string): Promise<boolean> {
    try {
      // Check if there's an accepted proposal between them
      const proposalsQuery = query(
        collection(db, "proposals"),
        where("professionalId", "==", professionalId),
        where("status", "==", "accepted"),
      )

      const proposalsSnapshot = await getDocs(proposalsQuery)

      for (const proposalDoc of proposalsSnapshot.docs) {
        const proposal = proposalDoc.data() as Proposal

        // Check if the job belongs to this client
        const jobDoc = await getDoc(doc(db, "jobs", proposal.jobId))
        if (jobDoc.exists()) {
          const job = jobDoc.data() as Job
          if (job.clientId === clientId) {
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error("Error checking if client can review professional:", error)
      return false
    }
  },

  // Check if client has already reviewed professional
  async hasClientReviewedProfessional(clientId: string, professionalId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, "reviews"),
        where("clientId", "==", clientId),
        where("professionalId", "==", professionalId),
      )

      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error("Error checking if client has reviewed professional:", error)
      return false
    }
  },

  // Update a review
  async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
    try {
      // If rating is being updated, we need to recalculate professional rating
      if (updates.rating) {
        await runTransaction(db, async (transaction) => {
          // Read the current review first
          const reviewRef = doc(db, "reviews", reviewId)
          const reviewDoc = await transaction.get(reviewRef)

          if (!reviewDoc.exists()) {
            throw new Error("Review not found")
          }

          const oldReview = reviewDoc.data() as Review

          // Update the review
          transaction.update(reviewRef, {
            ...updates,
            updatedAt: Timestamp.now(),
          })

          // If rating changed, we'll recalculate after transaction
          return oldReview.professionalId
        }).then(async (professionalId) => {
          // Recalculate rating outside of transaction
          await professionalsService.updateProfessionalRating(professionalId)
        })
      } else {
        // Simple update without rating change
        const reviewRef = doc(db, "reviews", reviewId)
        await updateDoc(reviewRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        })
      }
    } catch (error) {
      console.error("Error updating review:", error)
      throw error
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const professionalId = await runTransaction(db, async (transaction) => {
        const reviewRef = doc(db, "reviews", reviewId)
        const reviewDoc = await transaction.get(reviewRef)

        if (!reviewDoc.exists()) {
          throw new Error("Review not found")
        }

        const review = reviewDoc.data() as Review
        transaction.delete(reviewRef)

        return review.professionalId
      })

      // Recalculate professional's rating after transaction
      await professionalsService.updateProfessionalRating(professionalId)
    } catch (error) {
      console.error("Error deleting review:", error)
      throw error
    }
  },
}
