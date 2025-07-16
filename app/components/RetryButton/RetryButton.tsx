interface RetryButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function RetryButton({ onClick, disabled = false }: RetryButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
    >
      Retry
    </button>
  )
}