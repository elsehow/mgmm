import { CSS_CLASSES } from '@/app/config/constants'

interface RetryButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function RetryButton({ onClick, disabled = false }: RetryButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={CSS_CLASSES.RETRY_BUTTON}
    >
      Retry
    </button>
  )
}