import express from 'express'
import { verifyToken, isAdmin } from '../middleware/auth.js'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
  sendMessage,
  getConversation,
  getRecentConversations,
  deleteMessage,
  deleteMessageForEveryone,
  getMessageInfo,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserFriendStats,
  getAllMessages,
  getAdminConversation,
  getAllUserConversations,
  getUnreadCount
} from '../controllers/chatController.js'

const router = express.Router()

// Friend routes
router.post('/friends/request', verifyToken, sendFriendRequest)
router.put('/friends/request/:requestId/accept', verifyToken, acceptFriendRequest)
router.put('/friends/request/:requestId/reject', verifyToken, rejectFriendRequest)
router.get('/friends', verifyToken, getFriends)
router.get('/friends/pending', verifyToken, getPendingRequests)
router.delete('/friends/:friendId', verifyToken, removeFriend)

// Block routes
router.post('/block', verifyToken, blockUser)
router.delete('/block/:blockedId', verifyToken, unblockUser)
router.get('/blocked', verifyToken, getBlockedUsers)

// Message routes
router.post('/messages', verifyToken, sendMessage)
router.get('/messages/conversation/:friendId', verifyToken, getConversation)
router.get('/messages/recent', verifyToken, getRecentConversations)
router.delete('/messages/:messageId', verifyToken, deleteMessage)
router.delete('/messages/:messageId/everyone', verifyToken, deleteMessageForEveryone)
router.get('/messages/:messageId/info', verifyToken, getMessageInfo)
router.get('/messages/unread-count', verifyToken, getUnreadCount)

// Follow routes
router.post('/follow', verifyToken, followUser)
router.delete('/follow/:followingId', verifyToken, unfollowUser)
router.get('/followers/:userId', verifyToken, getFollowers)
router.get('/following/:userId', verifyToken, getFollowing)

// User stats
router.get('/stats/:userId', verifyToken, getUserFriendStats)

// Admin routes
router.get('/admin/messages', verifyToken, isAdmin, getAllMessages)
router.get('/admin/conversation/:userId1/:userId2', verifyToken, isAdmin, getAdminConversation)
router.get('/admin/conversations', verifyToken, isAdmin, getAllUserConversations)

export default router
