interface RetryButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function RetryButton({ onClick, disabled = false }: RetryButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="retry-button"
    >
      Retry
    </button>
  )
}