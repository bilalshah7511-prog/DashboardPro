import { useTranslation } from 'react-i18next'
import { MdWarning, MdClose } from 'react-icons/md'

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, confirmText, cancelText, type = 'danger' }) => {
  const { t } = useTranslation()

  // Unused title prop removed - message is now the main heading

  if (!isOpen) return null

  const colors = {
    danger: { btn: 'bg-red-600 hover:bg-red-700', icon: 'text-red-600', bg: 'bg-red-100' },
    warning: { btn: 'bg-orange-600 hover:bg-orange-700', icon: 'text-orange-600', bg: 'bg-orange-100' },
    info: { btn: 'bg-blue-600 hover:bg-blue-700', icon: 'text-blue-600', bg: 'bg-blue-100' },
    success: { btn: 'bg-green-600 hover:bg-green-700', icon: 'text-green-600', bg: 'bg-green-100' }
  }

  const theme = colors[type] || colors.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <MdClose className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`${theme.bg} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6`}>
          <MdWarning className={`w-7 h-7 ${theme.icon}`} />
        </div>

        {/* Message as h2 */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6 leading-relaxed">
          {message}
        </h2>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            {cancelText || t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 ${theme.btn} text-white rounded-xl transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
          >
            {confirmText || t('yes')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
