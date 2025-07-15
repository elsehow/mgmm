import { Message } from '@/app/lib/types/conversation'
import RetryButton from '../RetryButton/RetryButton'

interface ChatMessageProps {
  message: Message
  onRetry?: (message: Message) => void
}

export default function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`message ${message.role} ${message.pending ? 'pending' : ''} ${message.error ? 'error' : ''}`}>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">
          {message.pending ? 'Sending...' : message.error ? 'Failed' : formatTimestamp(message.timestamp)}
          {message.error && onRetry && (
            <RetryButton onClick={() => onRetry(message)} />
          )}
        </div>
      </div>
    </div>
  )
}