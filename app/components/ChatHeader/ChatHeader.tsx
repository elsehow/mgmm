import { CSS_CLASSES } from '@/app/config/constants'
import DateNavigation from '../DateNavigation/DateNavigation'

interface ChatHeaderProps {
  currentDate: Date
  availableDates: string[]
  onNavigate: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
}

export default function ChatHeader({ 
  currentDate, 
  availableDates, 
  onNavigate, 
  onGoToToday 
}: ChatHeaderProps) {
  return (
    <header className={CSS_CLASSES.CHAT_HEADER}>
      <DateNavigation
        currentDate={currentDate}
        availableDates={availableDates}
        onNavigate={onNavigate}
        onGoToToday={onGoToToday}
      />
    </header>
  )
}