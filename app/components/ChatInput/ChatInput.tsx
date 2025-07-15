import { FormEvent } from 'react'
import { CSS_CLASSES, MESSAGE_STATES, UI_CONFIG } from '@/app/config/constants'

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
  placeholder = UI_CONFIG.CHAT.DEFAULT_PLACEHOLDER
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className={CSS_CLASSES.CHAT_FORM}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={CSS_CLASSES.CHAT_INPUT}
      />
      <button 
        type="submit" 
        disabled={disabled || !value.trim()}
        className={CSS_CLASSES.CHAT_SUBMIT}
      >
        {disabled ? MESSAGE_STATES.SENDING : MESSAGE_STATES.SEND}
      </button>
    </form>
  )
}