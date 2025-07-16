import { formatRelativeDate, canNavigate, isToday } from '@/app/lib/dateUtils'

interface DateNavigationProps {
  currentDate: Date
  availableDates: string[]
  onNavigate: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
}

export default function DateNavigation({ 
  currentDate, 
  availableDates, 
  onNavigate, 
  onGoToToday 
}: DateNavigationProps) {
  const canGoBack = canNavigate(currentDate, availableDates, 'prev')
  const canGoForward = canNavigate(currentDate, availableDates, 'next')
  const showTodayButton = !isToday(currentDate)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onNavigate('prev')}
        disabled={!canGoBack}
        className={`px-3 py-1 rounded ${
          canGoBack 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Previous chat"
      >
        ←
      </button>
      
      <span className="text-lg font-semibold min-w-[120px] text-center">
        {formatRelativeDate(currentDate)}
      </span>
      
      <button
        onClick={() => onNavigate('next')}
        disabled={!canGoForward}
        className={`px-3 py-1 rounded ${
          canGoForward 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Next chat"
      >
        →
      </button>
      
      {showTodayButton && (
        <button
          onClick={onGoToToday}
          className="ml-2 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm flex items-center gap-1"
          title="Go to today"
        >
          <span>🏠</span>
          Today
        </button>
      )}
    </div>
  )
}