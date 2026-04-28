import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { blogAPI } from '../services/api'
import { MdClose, MdCameraAlt } from 'react-icons/md'

const CreateBlogModal = ({ onClose, onSuccess }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    featuredImage: '',
    tags: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('imageSizeError'))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, featuredImage: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.title || !formData.description) {
      setError(t('requiredFields'))
      setLoading(false)
      return
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await blogAPI.createBlog({
        title: formData.title,
        description: formData.description,
        featuredImage: formData.featuredImage,
        tags
      })

      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('createBlog')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('featuredImage')}
            </label>
            <div className="flex flex-col items-center">
              {formData.featuredImage ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featuredImage: '' })}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition">
                  <MdCameraAlt className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('clickToUpload')}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">(Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('blogTitle')} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder={t('enterBlogTitle')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('blogDescription')} *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder={t('writeContent')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tags')}
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder={t('tagsPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('separateTags')}
            </p>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📝 {t('approvalNotice')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('createBlog')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBlogModal
