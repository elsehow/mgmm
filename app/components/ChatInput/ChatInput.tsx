import { FormEvent } from 'react'
import { MESSAGE_STATES, UI_CONFIG } from '@/app/config/constants'

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
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={disabled || !value.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? MESSAGE_STATES.SENDING : MESSAGE_STATES.SEND}
      </button>
    </form>
  )
}