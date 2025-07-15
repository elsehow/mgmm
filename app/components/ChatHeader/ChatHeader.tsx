import { CSS_CLASSES, UI_CONFIG } from '@/app/config/constants'

interface ChatHeaderProps {
  title?: string
  onNewChat: () => void
}

export default function ChatHeader({ title = UI_CONFIG.CHAT.DEFAULT_TITLE, onNewChat }: ChatHeaderProps) {
  return (
    <header className={CSS_CLASSES.CHAT_HEADER}>
      <h1>{title}</h1>
      <button onClick={onNewChat} className={CSS_CLASSES.NEW_CHAT_BTN}>
        New Chat
      </button>
    </header>
  )
}