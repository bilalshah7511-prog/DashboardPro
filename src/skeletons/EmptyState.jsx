import { MdInsertDriveFile, MdInbox, MdSearch, MdFolderOpen } from 'react-icons/md'

const icons = {
  file: MdInsertDriveFile,
  inbox: MdInbox,
  search: MdSearch,
  folder: MdFolderOpen
}

const EmptyState = ({ 
  icon = 'inbox', 
  title = 'No data found', 
  description = 'There are no items to display at the moment.',
  action = null 
}) => {
  const Icon = icons[icon] || MdInbox

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
