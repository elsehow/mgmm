import { Message } from '@/app/lib/types/conversation'
import { CSS_CLASSES, MESSAGE_STATES, DATE_FORMAT } from '@/app/config/constants'
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
    <div className={`${CSS_CLASSES.MESSAGE} ${message.role} ${message.pending ? MESSAGE_STATES.PENDING : ''} ${message.error ? MESSAGE_STATES.ERROR : ''}`}>
      <div className={CSS_CLASSES.MESSAGE_CONTENT}>
        <div className={CSS_CLASSES.MESSAGE_TEXT}>{message.content}</div>
        <div className={CSS_CLASSES.MESSAGE_TIME}>
          {message.pending ? MESSAGE_STATES.SENDING : message.error ? MESSAGE_STATES.FAILED : formatTimestamp(message.timestamp)}
          {message.error && onRetry && (
            <RetryButton onClick={() => onRetry(message)} />
          )}
        </div>
      </div>
    </div>
  )
}