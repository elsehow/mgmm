import { Message } from '@/app/lib/types/conversation'
import { MESSAGE_STATES, DATE_FORMAT, MESSAGE_ROLES } from '@/app/config/constants'
import RetryButton from '../RetryButton/RetryButton'

interface ChatMessageProps {
  message: Message
  onRetry?: (message: Message) => void
}

export default function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], DATE_FORMAT.TIME_OPTIONS)
  }

  return (
    <div className={`p-4 rounded-lg mb-4 ${message.role === MESSAGE_ROLES.USER ? 'opacity-50 ml-auto max-w-xs' : 'bg-gray-100 mr-auto max-w-xs'} ${message.pending ? 'opacity-50' : ''} ${message.error ? 'bg-red-100 border-red-300' : ''}`}>
      <div className="flex flex-col">
        <div className={`text-xl mb-2 ${message.role === MESSAGE_ROLES.USER ? 'text-gray-600' : 'text-gray-800'}`}>{message.content}</div>
        <div className="text-xs text-gray-500 flex items-center justify-between">
          {message.pending ? MESSAGE_STATES.SENDING : message.error ? MESSAGE_STATES.FAILED : formatTimestamp(message.timestamp)}
          {message.error && onRetry && (
            <RetryButton onClick={() => onRetry(message)} />
          )}
        </div>
      </div>
    </div>
  )
}