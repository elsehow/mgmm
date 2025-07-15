interface ChatHeaderProps {
  title: string
  onNewChat: () => void
}

export default function ChatHeader({ title, onNewChat }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <h1>{title}</h1>
      <button onClick={onNewChat} className="new-chat-btn">
        New Chat
      </button>
    </header>
  )
}