import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { chatAPI, userAPI } from '../services/api'
import { io } from 'socket.io-client'
import {
  MdSend, MdImage, MdPersonAdd, MdBlock, MdDelete,
  MdCheck, MdClose, MdMoreVert, MdSearch, MdChat,
  MdPeople, MdPerson, MdPersonRemove, MdRefresh,
  MdGroup, MdVisibility, MdMic, MdStop
} from 'react-icons/md'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Chat = () => {
  const location = useLocation()
  const initialSelectedUserId = location.state?.selectedUserId
  const initialActiveTab = location.state?.activeTab || 'chat'
  const { user, isAdmin } = useAuth()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(initialActiveTab)
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [modalSearchQuery, setModalSearchQuery] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioPreview, setAudioPreview] = useState(null)
  const [recentConversations, setRecentConversations] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [adminConversations, setAdminConversations] = useState([])
  const [adminSelectedConversation, setAdminSelectedConversation] = useState(null)
  const [adminMessages, setAdminMessages] = useState([])
  const [messageMenuOpen, setMessageMenuOpen] = useState(null)
  const [messageInfoModal, setMessageInfoModal] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null)
  const [imagePreviewModal, setImagePreviewModal] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const selectedFriendRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Keep selectedFriendRef in sync
  useEffect(() => {
    selectedFriendRef.current = selectedFriend
  }, [selectedFriend])

  const isDark = theme === 'dark'

  // Initialize socket connection
  useEffect(() => {
    if (!user) return

    socketRef.current = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user.id)
    })

    socketRef.current.on('new_message', (data) => {
      const currentSelectedFriend = selectedFriendRef.current
      if (currentSelectedFriend && (data.senderId === currentSelectedFriend.friend_id || data.receiverId === currentSelectedFriend.friend_id)) {
        setMessages(prev => [...prev, data])
      }
      fetchRecentConversations()
    })

    socketRef.current.on('new_friend_request', (data) => {
      fetchPendingRequests()
      showToast(`New friend request from ${data?.senderName || 'someone'}`, 'success')
    })

    socketRef.current.on('friend_request_accepted', (data) => {
      fetchFriends()
      showToast(`${data?.receiverName || 'Someone'} accepted your friend request!`, 'success')
    })

    socketRef.current.on('typing', (data) => {
      setTypingUsers(prev => ({ ...prev, [data.senderId]: data.isTyping }))
      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [data.senderId]: false }))
      }, 3000)
    })

    // Online status tracking
    socketRef.current.on('user_online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]))
    })

    socketRef.current.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Recording timer
  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Auto-select initial user conversation when provided from navigation
  useEffect(() => {
    if (initialSelectedUserId && friends.length > 0) {
      const friend = friends.find(f => f.friend_id === initialSelectedUserId)
      if (friend) {
        fetchConversation(friend)
      }
    }
  }, [initialSelectedUserId, friends])

  // Handle activeTab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state?.activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchFriends(),
        fetchPendingRequests(),
        fetchBlockedUsers(),
        fetchRecentConversations(),
        fetchAllUsers()
      ])
      if (isAdmin()) {
        await fetchAdminConversations()
      }
    } catch (error) {
      console.error('Error fetching chat data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const response = await chatAPI.getFriends()
      setFriends(response.data.friends || [])
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await chatAPI.getPendingRequests()
      setPendingRequests(response.data.requests || [])
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  const fetchBlockedUsers = async () => {
    try {
      const response = await chatAPI.getBlockedUsers()
      setBlockedUsers(response.data.blockedUsers || [])
    } catch (error) {
      console.error('Error fetching blocked users:', error)
    }
  }

  const fetchRecentConversations = async () => {
    try {
      const response = await chatAPI.getRecentConversations()
      setRecentConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Error fetching recent conversations:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching available users...')
      const response = await userAPI.getAvailable()
      console.log('Available users response:', response.data)
      setAllUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('Failed to load users', 'error')
    }
  }

  const fetchAdminConversations = async () => {
    try {
      const response = await chatAPI.getAllUserConversations()
      setAdminConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Error fetching admin conversations:', error)
    }
  }

  const fetchConversation = async (friend) => {
    try {
      // Clear previous messages and friend first to prevent old chat showing
      setMessages([])
      setSelectedFriend(friend)
      const response = await chatAPI.getConversation(friend.friend_id)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error fetching conversation:', error)
      showToast(error.response?.data?.message || 'Failed to load conversation', 'error')
      setSelectedFriend(null)
      setMessages([])
    }
  }

  const fetchAdminConversation = async (userId1, userId2) => {
    try {
      const response = await chatAPI.getAdminConversation(userId1, userId2)
      setAdminMessages(response.data.messages || [])
      setAdminSelectedConversation({ userId1, userId2 })
    } catch (error) {
      console.error('Error fetching admin conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return

    try {
      const response = await chatAPI.sendMessage(selectedFriend.friend_id, newMessage)
      const messageData = response.data.data

      // Emit via socket for real-time
      socketRef.current?.emit('send_message', {
        ...messageData,
        senderName: user.name,
        senderImage: user.profile_image
      })

      setMessages(prev => [...prev, { ...messageData, sender_name: user.name, sender_image: user.profile_image }])
      setNewMessage('')
      fetchRecentConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      showToast(error.response?.data?.message || 'Failed to send message', 'error')
    }
  }

  const handleTyping = () => {
    if (selectedFriend && socketRef.current) {
      socketRef.current.emit('typing', {
        senderId: user.id,
        receiverId: selectedFriend.friend_id,
        isTyping: true
      })
    }
  }

  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const sendFriendRequest = async (friendId) => {
    try {
      const response = await chatAPI.sendFriendRequest(friendId)
      showToast(response.data?.message || 'Friend request sent successfully!', 'success')
      // Refresh all lists to update UI
      await Promise.all([
        fetchPendingRequests(),
        fetchAllUsers(),
        fetchFriends()
      ])
      // Emit socket event after successful API call and list refresh
      if (socketRef.current?.connected) {
        socketRef.current.emit('friend_request_sent', {
          senderId: user.id,
          receiverId: friendId,
          senderName: user.name
        })
      }
      return true
    } catch (error) {
      console.error('Error sending friend request:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send friend request'
      showToast(errorMsg, 'error')
      return false
    }
  }

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await chatAPI.acceptFriendRequest(requestId)
      showToast(response.data?.message || 'Friend request accepted!', 'success')
      // Refresh lists
      await Promise.all([fetchPendingRequests(), fetchFriends()])
      // Emit socket event after successful API call
      if (socketRef.current?.connected) {
        socketRef.current.emit('friend_request_accepted', {
          requestId,
          senderId: user.id,
          receiverName: user.name
        })
      }
    } catch (error) {
      console.error('Error accepting friend request:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to accept friend request'
      showToast(errorMsg, 'error')
      // Still refresh lists in case the request succeeded but there was a network error
      await Promise.all([fetchPendingRequests(), fetchFriends()])
    }
  }

  const rejectFriendRequest = async (requestId) => {
    try {
      await chatAPI.rejectFriendRequest(requestId)
      showToast('Friend request rejected', 'success')
      fetchPendingRequests()
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      showToast(error.response?.data?.message || 'Failed to reject friend request', 'error')
    }
  }

  const removeFriend = async (friendId) => {
    if (!confirm(t('confirmRemoveFriend') || 'Are you sure you want to remove this friend?')) return
    try {
      await chatAPI.removeFriend(friendId)
      showToast('Friend removed successfully', 'success')
      fetchFriends()
      if (selectedFriend?.friend_id === friendId) {
        setSelectedFriend(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error removing friend:', error)
      showToast(error.response?.data?.message || 'Failed to remove friend', 'error')
    }
  }

  const blockUser = async (blockedId) => {
    if (!confirm(t('confirmBlockUser'))) return
    try {
      await chatAPI.blockUser(blockedId)
      fetchBlockedUsers()
      fetchFriends()
      if (selectedFriend?.friend_id === blockedId) {
        setSelectedFriend(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  const unblockUser = async (blockedId) => {
    try {
      await chatAPI.unblockUser(blockedId)
      fetchBlockedUsers()
    } catch (error) {
      console.error('Error unblocking user:', error)
    }
  }

  // Check if message is within 1 hour (for delete for everyone)
  const canDeleteForEveryone = (createdAt) => {
    const messageTime = new Date(createdAt).getTime()
    const currentTime = new Date().getTime()
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    return (currentTime - messageTime) <= oneHour
  }

  const deleteMessage = async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m.id !== parseInt(messageId)))
      setDeleteConfirmModal(null)
      showToast('Message deleted', 'success')
    } catch (error) {
      console.error('Error deleting message:', error)
      showToast('Failed to delete message', 'error')
    }
  }

  const deleteMessageForEveryone = async (messageId) => {
    try {
      await chatAPI.deleteMessageForEveryone(messageId)
      setMessages(prev => prev.filter(m => m.id !== parseInt(messageId)))
      setDeleteConfirmModal(null)
      showToast('Message deleted for everyone', 'success')
    } catch (error) {
      console.error('Error deleting message for everyone:', error)
      showToast(error.response?.data?.message || 'Failed to delete message', 'error')
    }
  }

  const openMessageInfo = async (messageId) => {
    try {
      const response = await chatAPI.getMessageInfo(messageId)
      setMessageInfoModal(response.data.messageInfo)
    } catch (error) {
      console.error('Error getting message info:', error)
      showToast('Failed to get message info', 'error')
    }
  }

  // Resize image to max dimensions
  const resizeImage = (base64, maxWidth = 800, maxHeight = 600) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = base64
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
    })
  }

  // Handle image selection with preview
  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const resized = await resizeImage(reader.result, 800, 600)
      setImagePreview(resized)
    }
    reader.readAsDataURL(file)
  }

  // Send image message
  const sendImageMessage = async () => {
    if (!imagePreview || !selectedFriend) return
    try {
      const response = await chatAPI.sendMessage(selectedFriend.friend_id, null, imagePreview)
      const messageData = response.data.data
      socketRef.current?.emit('send_message', {
        ...messageData,
        senderName: user.name,
        senderImage: user.profile_image
      })
      setMessages(prev => [...prev, { ...messageData, sender_name: user.name, sender_image: user.profile_image }])
      setImagePreview(null)
      fetchRecentConversations()
    } catch (error) {
      console.error('Error sending image:', error)
      showToast('Failed to send image', 'error')
    }
  }

  // Voice recording functions
  const audioBlobRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioBlobRef.current = audioBlob
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioPreview(audioUrl)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setAudioPreview(null)
    } catch (error) {
      console.error('Error starting recording:', error)
      showToast('Could not access microphone', 'error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  const sendVoiceMessage = async () => {
    if (!audioBlobRef.current || !audioPreview || !selectedFriend) return

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result
        try {
          const response = await chatAPI.sendMessage(selectedFriend.friend_id, null, base64Audio)
          const messageData = response.data.data
          socketRef.current?.emit('send_message', {
            ...messageData,
            senderName: user.name,
            senderImage: user.profile_image
          })
          setMessages(prev => [...prev, { ...messageData, sender_name: user.name, sender_image: user.profile_image }])
          fetchRecentConversations()
          // Clear preview after sending
          setAudioPreview(null)
          audioBlobRef.current = null
        } catch (error) {
          console.error('Error sending voice:', error)
          showToast('Failed to send voice message', 'error')
        }
      }
      reader.readAsDataURL(audioBlobRef.current)
    } catch (error) {
      console.error('Error reading audio:', error)
      showToast('Failed to process audio', 'error')
    }
  }

  const cancelRecording = () => {
    setAudioPreview(null)
    audioBlobRef.current = null
    setIsRecording(false)
    setRecordingTime(0)
  }

  const filteredUsers = allUsers.filter(u =>
    u.id !== user?.id &&
    !friends.some(f => f.friend_id === u.id) &&
    !blockedUsers.some(b => b.blocked_id === u.id) &&
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderChatTab = () => (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Friends List */}
      <div className={`w-80 rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {t('friends')} ({friends.length})
            </h3>
            <button
              onClick={() => {
                setShowAddFriendModal(true)
                setModalSearchQuery('')
                fetchAllUsers()
              }}
              className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
            >
              <MdPersonAdd size={20} />
            </button>
          </div>
          {showUserSearch && (
            <div className="relative">
              <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('searchUsers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-100'
                }`}
              />
            </div>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100%-80px)]">
          {showUserSearch && searchQuery && (
            <div className={`p-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('searchResults')}</p>
              {filteredUsers.map(u => (
                <div key={u.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    {u.profile_image ? (
                      <img src={u.profile_image} alt={u.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{u.name}</span>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(u.id)}
                    className="p-1 rounded-full hover:bg-green-100 text-green-600"
                  >
                    <MdPersonAdd size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {recentConversations.map(conv => (
            <div
              key={conv.other_user_id}
              onClick={() => fetchConversation({ friend_id: conv.other_user_id, name: conv.other_user_name, profile_image: conv.other_user_image })}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                selectedFriend?.friend_id === conv.other_user_id
                  ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50')
                  : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
              }`}
            >
              {conv.other_user_image ? (
                <img src={conv.other_user_image} alt={conv.other_user_name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {conv.other_user_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {conv.other_user_name}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {conv.last_message?.substring(0, 30)}{conv.last_message?.length > 30 ? '...' : ''}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {conv.unread_count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 rounded-lg shadow flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedFriend.profile_image ? (
                    <img src={selectedFriend.profile_image} alt={selectedFriend.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {selectedFriend.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Online indicator - only in chat tab */}
                  {activeTab === 'chat' && onlineUsers.has(selectedFriend.friend_id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{selectedFriend.name}</p>
                  {activeTab === 'chat' && onlineUsers.has(selectedFriend.friend_id) ? (
                    <p className="text-xs text-green-500">{t('online') || 'Online'}</p>
                  ) : typingUsers[selectedFriend.friend_id] ? (
                    <p className="text-xs text-green-500">{t('typing')}...</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Close Chat Button */}
                <button
                  onClick={() => {
                    setSelectedFriend(null)
                    setMessages([])
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                  title={t('closeChat') || 'Close Chat'}
                >
                  <MdClose size={20} />
                </button>
                <button
                  onClick={() => blockUser(selectedFriend.friend_id)}
                  className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  title={t('blockUser')}
                >
                  <MdBlock size={18} />
                </button>
                <button
                  onClick={() => removeFriend(selectedFriend.friend_id)}
                  className="p-2 rounded-full hover:bg-red-100 text-red-600"
                  title={t('removeFriend')}
                >
                  <MdPersonRemove size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              {messages.map((msg, index) => {
                const isMe = msg.sender_id === user.id
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                      {showAvatar && (
                        isMe ? (
                          user?.profile_image ? (
                            <img src={user.profile_image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
                              {user?.name?.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          msg.sender_image ? (
                            <img src={msg.sender_image} alt={msg.sender_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                              {msg.sender_name?.charAt(0).toUpperCase()}
                            </div>
                          )
                        )
                      )}
                      <div className={`group relative px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : (isDark ? 'bg-gray-700 text-white rounded-bl-none' : 'bg-white text-gray-800 rounded-bl-none shadow')
                      }`}>
                        {msg.image_url && (
                          msg.image_url.startsWith('data:audio') || msg.image_url.includes('audio/webm') ? (
                            <audio src={msg.image_url} controls className="max-w-[200px] h-8 mb-2" controlsList="nodownload" />
                          ) : (
                            <img
                              src={msg.image_url}
                              alt="Shared"
                              className="max-w-[200px] max-h-[200px] rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity object-cover"
                              onClick={() => setImagePreviewModal(msg.image_url)}
                            />
                          )
                        )}
                        {msg.content && <p>{msg.content}</p>}
                        <div className={`text-xs mt-1 flex items-center gap-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            <>
                              {msg.read_at ? (
                                // Message seen - blue/green double tick
                                <span className="text-green-400 font-bold" title="Read">✓✓</span>
                              ) : onlineUsers.has(selectedFriend?.friend_id) ? (
                                // User online but not read - gray double tick
                                <span className="text-gray-400" title="Delivered (user online)">✓✓</span>
                              ) : msg.delivered_at ? (
                                // User offline - single tick
                                <span className="text-gray-400" title="Delivered (user offline)">✓</span>
                              ) : (
                                // Just sent
                                <span className="text-blue-300" title="Sent">○</span>
                              )}
                            </>
                          )}
                        </div>
                        {/* Three dots menu for message options - only for my messages */}
                        {isMe && (
                          <div className="absolute -top-3 -right-3">
                            <button
                              onClick={() => setMessageMenuOpen(messageMenuOpen === msg.id ? null : msg.id)}
                              className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MdMoreVert size={14} />
                            </button>
                            {messageMenuOpen === msg.id && (
                              <div className={`absolute right-0 top-6 w-48 rounded-lg shadow-lg z-10 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                                <>
                                  <button
                                    onClick={() => {
                                      const isVoice = msg.image_url && (msg.image_url.startsWith('data:audio') || msg.image_url.includes('audio/webm'))
                                      setDeleteConfirmModal({
                                        messageId: msg.id,
                                        type: 'forMe',
                                        isVoice
                                      })
                                      setMessageMenuOpen(null)
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                                  >
                                    🗑️ {t('deleteForMe') || 'Delete for me'}
                                  </button>
                                  {canDeleteForEveryone(msg.created_at) && (
                                    <button
                                      onClick={() => {
                                        const isVoice = msg.image_url && (msg.image_url.startsWith('data:audio') || msg.image_url.includes('audio/webm'))
                                        setDeleteConfirmModal({
                                          messageId: msg.id,
                                          type: 'forEveryone',
                                          isVoice
                                        })
                                        setMessageMenuOpen(null)
                                      }}
                                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                                    >
                                      🗑️ {t('deleteForEveryone') || 'Delete for everyone'}
                                    </button>
                                  )}
                                </>
                                <button
                                  onClick={() => {
                                    openMessageInfo(msg.id)
                                    setMessageMenuOpen(null)
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                                >
                                  ℹ️ {t('messageInfo') || 'Message info'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <MdClose size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => !isRecording && fileInputRef.current?.click()}
                  disabled={isRecording}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                  title={t('sendImage') || 'Send Image'}
                >
                  <MdImage size={20} />
                </button>

                {/* Voice Recording Button */}
                <button
                  onClick={isRecording ? stopRecording : audioPreview ? startRecording : startRecording}
                  className={`p-2 rounded-full ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : audioPreview
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={isRecording ? (t('stopRecording') || 'Stop Recording') : audioPreview ? (t('recordAgain') || 'Record Again') : (t('recordVoice') || 'Record Voice')}
                >
                  {isRecording ? <MdStop size={20} /> : audioPreview ? <MdMic size={20} /> : <MdMic size={20} />}
                </button>

                {isRecording && (
                  <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                  </span>
                )}

                {/* Audio Preview - Play, Send, Cancel */}
                {audioPreview && !isRecording && (
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                    <audio src={audioPreview} controls className="h-8 w-32" />
                    <button
                      onClick={cancelRecording}
                      className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                      title={t('cancel') || 'Cancel'}
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !imagePreview) {
                      sendMessage()
                    } else if (e.key === 'Enter' && imagePreview) {
                      sendImageMessage()
                    }
                  }}
                  onKeyDown={handleTyping}
                  placeholder={t('typeMessage')}
                  disabled={isRecording}
                  className={`flex-1 px-4 py-2 rounded-full ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-100'
                  } disabled:opacity-50`}
                />

                {/* Send Button - works for text, image, or voice */}
                <button
                  onClick={() => {
                    if (audioPreview) {
                      sendVoiceMessage()
                    } else if (imagePreview) {
                      sendImageMessage()
                    } else {
                      sendMessage()
                    }
                  }}
                  disabled={!newMessage.trim() && !imagePreview && !audioPreview}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                  title={audioPreview ? (t('sendVoice') || 'Send Voice') : imagePreview ? (t('sendImage') || 'Send Image') : (t('sendMessage') || 'Send Message')}
                >
                  <MdSend size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MdChat size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('selectFriendToChat')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderFriendsTab = () => (
    <div className={`rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-4">
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {t('pendingRequests')} ({pendingRequests.length})
        </h3>
        {pendingRequests.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noPendingRequests')}</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  {req.profile_image ? (
                    <img src={req.profile_image} alt={req.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{req.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                    title={t('acceptRequest') || 'Accept Request'}
                  >
                    <MdCheck size={18} />
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(req.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    title={t('rejectRequest') || 'Reject Request'}
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {t('allFriends')} ({friends.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map(friend => (
            <div key={friend.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                {friend.profile_image ? (
                  <img src={friend.profile_image} alt={friend.name} className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{friend.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{friend.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchConversation(friend)
                    setActiveTab('chat')
                  }}
                  className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  title={t('sendMessage') || 'Send Message'}
                >
                  {t('message')}
                </button>
                <button
                  onClick={() => removeFriend(friend.friend_id)}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                  title={t('removeFriend') || 'Remove Friend'}
                >
                  <MdPersonRemove size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUsersTab = () => {
    // Filter users who are not already friends and don't have pending requests
    const availableUsers = allUsers.filter(u => {
      const isFriend = friends.some(f => f.friend_id === u.id)
      const hasPendingRequest = pendingRequests.some(r => r.user_id === u.id || r.friend_id === u.id)
      return !isFriend && !hasPendingRequest
    })

    const filteredUsers = searchQuery
      ? availableUsers.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      : availableUsers

    return (
      <div className={`rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {t('findFriends') || 'Find Friends'} ({availableUsers.length})
            </h3>
            <button
              onClick={() => {
                fetchAllUsers()
                fetchFriends()
                fetchPendingRequests()
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <MdRefresh size={20} />
            </button>
          </div>
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchUsers') || 'Search users by name or email...'}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        <div className="p-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <MdPersonAdd className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchQuery ? (t('noUsersFound') || 'No users found matching your search') : (t('noUsersAvailable') || 'No new users available. You are friends with everyone!')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(userItem => (
                <div key={userItem.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {userItem.profile_image ? (
                      <img src={userItem.profile_image} alt={userItem.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
                        {userItem.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{userItem.name}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{userItem.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(userItem.id)}
                    className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                  >
                    <MdPersonAdd size={18} />
                    {t('addFriend') || 'Add Friend'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderBlockedTab = () => (
    <div className={`rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-4">
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {t('blockedUsers')} ({blockedUsers.length})
        </h3>
        {blockedUsers.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noBlockedUsers')}</p>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map(blocked => (
              <div key={blocked.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  {blocked.profile_image ? (
                    <img src={blocked.profile_image} alt={blocked.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      {blocked.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{blocked.name}</span>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('blockedOn')} {new Date(blocked.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => unblockUser(blocked.blocked_id)}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  title={t('unblockUser') || 'Unblock User'}
                >
                  {t('unblock')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderAdminTab = () => (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      <div className={`w-80 rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('allConversations')}</h3>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {adminConversations.map(conv => (
            <div
              key={`${conv.user1_id}-${conv.user2_id}`}
              onClick={() => fetchAdminConversation(conv.user1_id, conv.user2_id)}
              className={`p-3 cursor-pointer transition-colors ${
                adminSelectedConversation?.userId1 === conv.user1_id && adminSelectedConversation?.userId2 === conv.user2_id
                  ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50')
                  : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
              }`}
            >
              <p className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {conv.user1_name} ↔ {conv.user2_name}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {conv.message_count} {t('messages')} • {new Date(conv.last_message_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 rounded-lg shadow flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {adminSelectedConversation ? (
          <>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {t('conversationBetween')} {adminMessages[0]?.sender_name} & {adminMessages[0]?.receiver_name}
              </p>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              {adminMessages.map((msg, index) => {
                const showAvatar = index === 0 || adminMessages[index - 1].sender_id !== msg.sender_id
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {showAvatar && (
                        msg.sender_image ? (
                          <img src={msg.sender_image} alt={msg.sender_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                            {msg.sender_name?.charAt(0).toUpperCase()}
                          </div>
                        )
                      )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      isDark ? 'bg-gray-700 text-white rounded-bl-none' : 'bg-white rounded-bl-none shadow'
                    }`}>
                      {msg.image_url && (
                        msg.image_url.startsWith('data:audio') || msg.image_url.includes('audio/webm') ? (
                          <div className="flex items-center gap-2">
                            <audio src={msg.image_url} controls className="max-w-[200px] h-8 mb-2" />
                            <a
                              href={msg.image_url}
                              download={`voice_${msg.id}.webm`}
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <img src={msg.image_url} alt="Shared" className="max-w-full rounded-lg mb-2" />
                        )
                      )}
                      {msg.content && <p>{msg.content}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {msg.sender_name}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MdVisibility size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('selectConversationToView')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={`h-12 rounded-lg animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className={`h-96 rounded-lg animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('chat')}</h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('chatDescription')}</p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white'
              : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
          }`}
        >
          <MdChat size={18} />
          {t('messages')}
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'friends'
              ? 'bg-blue-600 text-white'
              : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
          }`}
        >
          <MdPeople size={18} />
          {t('friends')}
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
          }`}
        >
          <MdPersonAdd size={18} />
          {t('findFriends') || 'Find Friends'}
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'blocked'
              ? 'bg-blue-600 text-white'
              : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
          }`}
        >
          <MdBlock size={18} />
          {t('blocked')}
        </button>
        {isAdmin() && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white'
                : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
            }`}
          >
            <MdVisibility size={18} />
            {t('monitor')}
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'chat' && renderChatTab()}
      {activeTab === 'friends' && renderFriendsTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'blocked' && renderBlockedTab()}
      {activeTab === 'admin' && isAdmin() && renderAdminTab()}

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {t('addFriend') || 'Add Friend'}
              </h3>
              <button
                onClick={() => setShowAddFriendModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Search */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder={t('searchUsers') || 'Search users by name or email...'}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-800'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  autoFocus
                />
              </div>
            </div>

            {/* Users List */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {(() => {
                console.log('Modal render - allUsers:', allUsers.length, allUsers)
                console.log('Modal render - friends:', friends.length)
                console.log('Modal render - pendingRequests:', pendingRequests.length)
                console.log('Modal render - user:', user?.id)
                // Filter users who are not friends, not blocked, not pending, and match search
                const availableUsers = allUsers.filter(u => {
                  if (u.id === user.id) return false
                  const isFriend = friends.some(f => f.friend_id === u.id)
                  const hasPending = pendingRequests.some(r => r.user_id === u.id || r.friend_id === u.id)
                  const isBlocked = blockedUsers.some(b => b.blocked_id === u.id || b.blocker_id === u.id)
                  return !isFriend && !hasPending && !isBlocked
                })

                const searchedUsers = modalSearchQuery
                  ? availableUsers.filter(u =>
                      u.name?.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                      u.email?.toLowerCase().includes(modalSearchQuery.toLowerCase())
                    )
                  : availableUsers

                if (searchedUsers.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <MdPersonAdd className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {modalSearchQuery
                          ? (t('noUsersFound') || 'No users found matching your search')
                          : (t('noUsersAvailable') || 'No users available. You are friends with everyone!')}
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchedUsers.map(u => (
                      <div
                        key={u.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        {u.profile_image ? (
                          <img src={u.profile_image} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{u.name}</p>
                          {u.email && (
                            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            const success = await sendFriendRequest(u.id)
                            if (success) {
                              setShowAddFriendModal(false)
                            }
                          }}
                          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          title={t('sendFriendRequest') || 'Send friend request'}
                        >
                          <MdPersonAdd size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <MdCheck size={20} />
            ) : (
              <MdClose size={20} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Message Info Modal */}
      {messageInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {t('messageInfo') || 'Message Info'}
              </h3>
              <button
                onClick={() => setMessageInfoModal(null)}
                className={`p-2 rounded-full hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              >
                <MdClose size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <MdSend size={20} />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('sent') || 'Sent'}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(messageInfoModal.sent_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {messageInfoModal.delivered_at && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <MdCheck size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('delivered') || 'Delivered'}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(messageInfoModal.delivered_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {messageInfoModal.read_at && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <MdVisibility size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('read') || 'Read'}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(messageInfoModal.read_at).toLocaleString()}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('by') || 'by'} {messageInfoModal.receiver_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {t('confirmDelete') || 'Confirm Delete'}
              </h3>
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className={`p-2 rounded-full hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              >
                <MdClose size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl">🗑️</span>
                </div>
              </div>
              <p className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {deleteConfirmModal.isVoice
                  ? (deleteConfirmModal.type === 'forEveryone'
                    ? (t('confirmDeleteVoiceEveryone') || 'Are you sure you want to delete this voice message for everyone?')
                    : (t('confirmDeleteVoice') || 'Are you sure you want to delete this voice message?'))
                  : (deleteConfirmModal.type === 'forEveryone'
                    ? (t('confirmDeleteMessageEveryone') || 'Are you sure you want to delete this message for everyone?')
                    : (t('confirmDeleteMessage') || 'Are you sure you want to delete this message?'))
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmModal(null)}
                  className={`flex-1 py-2 px-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmModal.type === 'forEveryone') {
                      deleteMessageForEveryone(deleteConfirmModal.messageId)
                    } else {
                      deleteMessage(deleteConfirmModal.messageId)
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {t('delete') || 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setImagePreviewModal(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={imagePreviewModal}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <a
                href={imagePreviewModal}
                download="image.jpg"
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                title={t('download') || 'Download'}
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImagePreviewModal(null)
                }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                title={t('close') || 'Close'}
              >
                <MdClose size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
