import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Notification {
  id?: string
  userId: string
  type:
    | "job_posted"
    | "proposal_received"
    | "proposal_accepted"
    | "proposal_rejected"
    | "job_completed"
    | "review_received"
  title: string
  message: string
  read: boolean
  actionUrl?: string
  metadata?: {
    jobId?: string
    proposalId?: string
    professionalId?: string
    clientId?: string
  }
  createdAt: Date
}

// Helper function to safely convert Firestore timestamps to dates
const convertTimestampToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date()
  }

  if (timestamp instanceof Date) {
    return timestamp
  }

  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate()
  }

  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000)
  }

  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? new Date() : date
  }

  return new Date()
}

export const notificationsService = {
  // Create a notification
  async createNotification(notificationData: Omit<Notification, "id" | "createdAt">): Promise<string> {
    try {
      const notification = {
        ...notificationData,
        createdAt: Timestamp.now(),
      }
      const docRef = await addDoc(collection(db, "notifications"), notification)
      return docRef.id
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  },

  // Get notifications for a user (without orderBy to avoid index requirement)
  async getNotifications(userId: string, limitCount = 50): Promise<Notification[]> {
    try {
      const q = query(collection(db, "notifications"), where("userId", "==", userId), limit(limitCount))

      const querySnapshot = await getDocs(q)
      const notifications = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToDate(data.createdAt),
        } as Notification
      })

      // Sort manually by creation date (newest first)
      return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error getting notifications:", error)
      return []
    }
  },

  // Subscribe to real-time notifications (without orderBy to avoid index requirement)
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    limitCount = 50,
  ): () => void {
    try {
      const q = query(collection(db, "notifications"), where("userId", "==", userId), limit(limitCount))

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const notifications = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: convertTimestampToDate(data.createdAt),
            } as Notification
          })

          // Sort manually by creation date (newest first)
          const sortedNotifications = notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          callback(sortedNotifications)
        },
        (error) => {
          console.error("Error in notifications subscription:", error)
          // Fallback to manual fetch
          notificationsService.getNotifications(userId, limitCount).then(callback)
        },
      )

      return unsubscribe
    } catch (error) {
      console.error("Error setting up notifications subscription:", error)
      // Return a no-op function
      return () => {}
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, "notifications", notificationId)
      await updateDoc(docRef, { read: true })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId)
      const unreadNotifications = notifications.filter((n) => !n.read)

      const updatePromises = unreadNotifications.map((notification) => this.markAsRead(notification.id!))

      await Promise.all(updatePromises)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getNotifications(userId)
      return notifications.filter((n) => !n.read).length
    } catch (error) {
      console.error("Error getting unread count:", error)
      return 0
    }
  },

  // Helper methods for specific notification types
  async createJobPostedNotification(userId: string, jobTitle: string, jobId: string): Promise<string> {
    return this.createNotification({
      userId,
      type: "job_posted",
      title: "Job Posted Successfully",
      message: `Your job "${jobTitle}" has been posted and is now visible to professionals.`,
      read: false,
      actionUrl: `/my-jobs`,
      metadata: { jobId },
    })
  },

  async createProposalReceivedNotification(
    userId: string,
    jobTitle: string,
    professionalName: string,
    jobId: string,
    proposalId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "proposal_received",
      title: "New Proposal Received",
      message: `${professionalName} has submitted a proposal for your job "${jobTitle}".`,
      read: false,
      actionUrl: `/my-jobs/${jobId}/proposals`,
      metadata: { jobId, proposalId },
    })
  },

  async createProposalStatusNotification(
    userId: string,
    jobTitle: string,
    status: "accepted" | "rejected",
    jobId: string,
    proposalId: string,
  ): Promise<string> {
    const title = status === "accepted" ? "Proposal Accepted!" : "Proposal Update"
    const message =
      status === "accepted"
        ? `Congratulations! Your proposal for "${jobTitle}" has been accepted.`
        : `Your proposal for "${jobTitle}" was not selected this time.`

    return this.createNotification({
      userId,
      type: status === "accepted" ? "proposal_accepted" : "proposal_rejected",
      title,
      message,
      read: false,
      actionUrl: `/my-proposals`,
      metadata: { jobId, proposalId },
    })
  },

  async createReviewReceivedNotification(
    userId: string,
    clientName: string,
    rating: number,
    jobTitle?: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "review_received",
      title: "New Review Received",
      message: `${clientName} left you a ${rating}-star review${jobTitle ? ` for "${jobTitle}"` : ""}.`,
      read: false,
      actionUrl: `/profile`,
      metadata: { clientId: userId },
    })
  },
}
