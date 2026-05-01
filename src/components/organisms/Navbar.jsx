import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { HiMenu } from 'react-icons/hi'
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit, FaChevronDown, FaMoon, FaSun, FaGlobe, FaBell, FaCheck, FaTrash } from 'react-icons/fa'
import { ReplyIcon } from '../atoms'
import { EmptyState, NotificationSkeleton } from '../../skeletons'
import api, { blogAPI, chatAPI } from '../../services/api'
import socketService from '../../services/socket'
import { MdChat, MdMarkEmailRead, MdMessage, MdPerson, MdDelete as MdDeleteIcon } from 'react-icons/md'

const Navbar = ({ setSidebarOpen, onEditProfile }) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [activeNotifTab, setActiveNotifTab] = useState('unread')
  const [showAllNotifModal, setShowAllNotifModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const allNotifScrollRef = useRef(null)

  // Message notifications state
  const [showMessages, setShowMessages] = useState(false)
  const [messageConversations, setMessageConversations] = useState([])
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesRef = useRef(null)
  const [activeChatUser, setActiveChatUser] = useState(null)

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(n => {
    if (activeNotifTab === 'unread') return !n.is_read
    return n.is_read
  })

  // Handle scroll for infinite scroll in all notifications modal
  const handleAllNotifScroll = () => {
    if (!allNotifScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = allNotifScrollRef.current
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleCount(prev => Math.min(prev + 10, notifications.length))
    }
  }
  const dropdownRef = useRef(null)
  const langMenuRef = useRef(null)
  const notificationRef = useRef(null)

  // Fetch message conversations
  const fetchMessageConversations = async () => {
    if (!user) return
    setLoadingMessages(true)
    try {
      const [conversationsRes, unreadRes] = await Promise.all([
        chatAPI.getRecentConversations(),
        chatAPI.getUnreadCount()
      ])
      setMessageConversations(conversationsRes.data.conversations || [])
      setUnreadMessageCount(unreadRes.data.unreadCount || 0)
    } catch (error) {
      console.error('❌ Failed to fetch message conversations:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Mark messages as read for a conversation
  const handleMarkMessagesRead = async (friendId) => {
    try {
      // Fetch conversation to mark as read
      await chatAPI.getConversation(friendId)
      setUnreadMessageCount(prev => Math.max(0, prev - 1))
      setMessageConversations(prev =>
        prev.map(conv =>
          conv.other_user_id === friendId ? { ...conv, unread_count: 0 } : conv
        )
      )
    } catch (error) {
      console.error('Failed to mark messages read:', error)
    }
  }

  // Handle message notification click
  const handleMessageClick = (conv) => {
    if (conv.unread_count > 0) {
      handleMarkMessagesRead(conv.other_user_id)
    }
    setShowMessages(false)
    navigate('/chat', { state: { selectedUserId: conv.other_user_id } })
  }

  // Format time ago for messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return t('justNow') || 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`
    return date.toLocaleDateString()
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      console.log('⚠️ No user, skipping notification fetch')
      return
    }
    console.log('🔔 Fetching notifications for user:', user.id)
    setLoadingNotifications(true)
    try {
      const [notifRes, countRes] = await Promise.all([
        blogAPI.getNotifications(),
        blogAPI.getUnreadCount()
      ])
      console.log('📨 Notifications response:', notifRes.data)
      console.log('📊 Unread count:', countRes.data)
      setNotifications(notifRes.data.notifications || [])
      setUnreadCount(countRes.data.count || 0)
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Mark notification as read
  const handleMarkRead = async (notifId) => {
    console.log('🔵 Mark read clicked for:', notifId)
    try {
      await blogAPI.markNotificationRead(notifId)
      setNotifications(prev => prev.map(n => 
        n.id === notifId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
      console.log('✅ Marked as read:', notifId)
    } catch (error) {
      console.error('❌ Failed to mark notification read:', error)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await blogAPI.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all read:', error)
    }
  }

  // Delete notification
  const handleDeleteNotif = async (notifId) => {
    console.log('🔴 Delete clicked for:', notifId)
    try {
      const deletedNotif = notifications.find(n => n.id === notifId)
      await blogAPI.deleteNotification(notifId)
      setNotifications(prev => prev.filter(n => n.id !== notifId))
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      console.log('✅ Deleted notification:', notifId)
    } catch (error) {
      console.error('❌ Failed to delete notification:', error)
    }
  }

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = async (notif) => {
    console.log('👆 Notification clicked:', notif.id)
    if (!notif.is_read) {
      console.log('📖 Marking as read on click...')
      await handleMarkRead(notif.id)
    }
    setShowNotifications(false)
    if (notif.blog_id) {
      navigate(`/blogs/${notif.blog_id}`)
    } else if (notif.type === 'friend_request') {
      // Navigate to chat friends tab for friend requests
      navigate('/chat', { state: { activeTab: 'friends' } })
    } else if (notif.type === 'friend_accepted') {
      // Navigate to chat page when friend request is accepted
      navigate('/chat')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setShowMessages(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications()
    fetchMessageConversations()
    const interval = setInterval(() => {
      fetchNotifications()
      fetchMessageConversations()
    }, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!user) return

    // Connect to socket
    socketService.connect()

    // Join user's room
    socketService.joinUserRoom(user.id)

    // Listen for new notifications
    socketService.onNewNotification((newNotification) => {
      console.log('🔔 New notification received:', newNotification)
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/logo.png'
        })
      }
    })

    // Listen for new messages via socket
    socketService.onNewMessage((messageData) => {
      console.log('💬 New message received:', messageData)
      // Only increment if not currently viewing that chat
      if (activeChatUser !== messageData.sender_id) {
        setUnreadMessageCount(prev => prev + 1)
        fetchMessageConversations()

        // Show browser notification for message if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${messageData.sender_name || 'New Message'}`, {
            body: messageData.content || 'Sent you a message',
            icon: messageData.sender_image || '/logo.png'
          })
        }
      }
    })

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      socketService.removeAllListeners()
      socketService.disconnect()
    }
  }, [user, activeChatUser])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowLangMenu(false)
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      like: '❤️',
      comment: '💬',
      reply: '↩️',
      blog_approved: '✅',
      blog_rejected: '❌',
      friend_request: '👋',
      friend_accepted: '🤝'
    }
    return icons[type] || '📢'
  }

  // Extract first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }

  // Format time ago
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 transition-colors">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
      >
        <HiMenu className="w-6 h-6" />
      </button>

      <div className="flex-1 lg:flex-none"></div>

      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Change Language"
          >
            <FaGlobe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                    i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <FaSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <FaMoon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Messages */}
        <div className="relative" ref={messagesRef}>
          <button
            onClick={() => {
              setShowMessages(!showMessages)
              if (!showMessages) fetchMessageConversations()
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition relative"
            title={t('messages') || 'Messages'}
          >
            <MdChat className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[450px] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('messages') || 'Messages'}</h3>
                {unreadMessageCount > 0 && (
                  <button
                    onClick={() => navigate('/chat')}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    {t('viewAll')}
                  </button>
                )}
              </div>

              {/* Message List */}
              <div className="overflow-y-auto flex-1 max-h-80">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messageConversations.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <MdChat className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noMessages') || 'No messages yet'}</p>
                    <button
                      onClick={() => {
                        setShowMessages(false)
                        navigate('/chat')
                      }}
                      className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      {t('startChat') || 'Start Chat'}
                    </button>
                  </div>
                ) : (
                  messageConversations.map((conv) => (
                    <div
                      key={conv.other_user_id}
                      onClick={() => handleMessageClick(conv)}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        conv.unread_count > 0 ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        {conv.other_user_image ? (
                          <img
                            src={conv.other_user_image}
                            alt={conv.other_user_name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                            <MdPerson className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-semibold text-sm truncate ${conv.unread_count > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {conv.other_user_name}
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatMessageTime(conv.last_message_time)}
                            </span>
                          </div>
                          {conv.last_message && (
                            <p className={`text-sm truncate mt-0.5 ${conv.unread_count > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                              {conv.last_message}
                            </p>
                          )}
                          {conv.unread_count > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                {conv.unread_count} {t('new') || 'new'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => {
                    setShowMessages(false)
                    navigate('/chat')
                  }}
                  className="w-full py-2 text-center text-green-600 dark:text-green-400 font-medium text-sm hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                >
                  {t('openChat') || 'Open Chat'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition relative"
            title="Notifications"
          >
            <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-hidden flex flex-col">
              {/* Header Title */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('notifications')}</h3>
              </div>

              {/* Tabs - Unread / Read */}
              <div className="flex px-4 py-2 gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setActiveNotifTab('unread')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activeNotifTab === 'unread'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                  }`}
                >
                  {t('unread')} ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveNotifTab('read')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activeNotifTab === 'read'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                  }`}
                >
                  {t('read')} ({notifications.length - unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1 max-h-80">
                {loadingNotifications ? (
                  <NotificationSkeleton />
                ) : filteredNotifications.length === 0 ? (
                  <div className="px-4 py-4">
                    <EmptyState 
                      icon="inbox"
                      title={activeNotifTab === 'unread' ? t('noUnreadNotifications') : t('noNotifications')}
                      description={activeNotifTab === 'unread' ? t('allCaughtUp') : t('noNotificationsDesc')}
                    />
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                        !notif.is_read ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar or Notice Icon */}
                        {notif.sender_image && !notif.sender_image.includes('notice.png') ? (
                          <img
                            src={notif.sender_image}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : notif.sender_name === 'Notice' || notif.type === 'blog_approved' || notif.type === 'blog_rejected' ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'blog_approved' ? 'bg-green-100 dark:bg-green-900' : notif.type === 'blog_rejected' ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <svg className={`w-6 h-6 ${notif.type === 'blog_approved' ? 'text-green-600 dark:text-green-400' : notif.type === 'blog_rejected' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                          </div>
                        ) : notif.type === 'reply' ? (
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <ReplyIcon className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {/* Title row with date */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                              {notif.type === 'blog_approved' || notif.type === 'blog_rejected'
                                ? `From : Notice`
                                : notif.sender_name
                                  ? `From : ${getFirstName(notif.sender_name)}`
                                  : `From : ${notif.title}`}
                            </p>
                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Message */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                            {notif.message}
                          </p>

                          {/* Unread indicator dot */}
                          {!notif.is_read && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              <span className="text-xs text-indigo-600 font-medium">{t('new')}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 ml-1">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkRead(notif.id)
                              }}
                              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full transition"
                              title={t('markAsRead')}
                            >
                              <FaCheck className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotif(notif.id)
                            }}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition"
                            title={t('delete')}
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View All Button */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    setShowAllNotifModal(true)
                    setVisibleCount(10)
                  }}
                  className="w-full py-2 text-center text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                >
                  {t('viewAll')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <FaChevronDown className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaUser className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">ID:</span>
                    <span className="text-gray-800 dark:text-gray-300">{user?.id}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span className="text-gray-800 dark:text-gray-300 truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaShieldAlt className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">Role:</span>
                    <span className="text-gray-800 dark:text-gray-300 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="px-2 py-2">
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    onEditProfile()
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg transition"
                >
                  <FaEdit className="text-lg" />
                  <span className="font-medium">{t('editProfile')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Notifications Modal */}
      {showAllNotifModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                {t('allNotifications') || 'All Notifications'} ({notifications.length})
              </h3>
              <button
                onClick={() => setShowAllNotifModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - All Notifications with Scroll */}
            <div
              ref={allNotifScrollRef}
              onScroll={handleAllNotifScroll}
              className="overflow-y-auto flex-1 p-4"
              style={{ maxHeight: '60vh' }}
            >
              {notifications.length === 0 ? (
                <EmptyState 
                  icon="inbox"
                  title={t('noNotifications')}
                  description={t('noNotificationsDesc')}
                />
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, visibleCount).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        handleNotificationClick(notif)
                        setShowAllNotifModal(false)
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition border ${
                        !notif.is_read
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar or Notice Icon */}
                        {notif.sender_image && !notif.sender_image.includes('notice.png') ? (
                          <img
                            src={notif.sender_image}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : notif.sender_name === 'Notice' || notif.type === 'blog_approved' || notif.type === 'blog_rejected' ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'blog_approved' ? 'bg-green-100 dark:bg-green-900' : notif.type === 'blog_rejected' ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <svg className={`w-6 h-6 ${notif.type === 'blog_approved' ? 'text-green-600 dark:text-green-400' : notif.type === 'blog_rejected' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                            <FaBell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-800 dark:text-white">
                              {notif.type === 'blog_approved' || notif.type === 'blog_rejected' ? 'Notice' : getFirstName(notif.sender_name) || 'System'}
                            </p>
                            {!notif.is_read && (
                              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                                {t('new')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTime(notif.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkRead(notif.id)
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition"
                              title={t('markAsRead')}
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotif(notif.id)
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                            title={t('delete')}
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading more indicator */}
                  {visibleCount < notifications.length && (
                    <div className="text-center py-4">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {t('loadingMore') || 'Loading more...'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('showing')} {Math.min(visibleCount, notifications.length)} {t('of')} {notifications.length} {t('notifications').toLowerCase()}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
