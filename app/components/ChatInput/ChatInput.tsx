import { FormEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  placeholder = "Type your message..."
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="chat-form">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="chat-input"
      />
      <button 
        type="submit" 
        disabled={disabled || !value.trim()}
        className="chat-submit"
      >
        {disabled ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}