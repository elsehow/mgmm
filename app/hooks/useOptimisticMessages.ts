import { useState, useCallback } from 'react'
import { Message } from '@/app/lib/types/conversation'
import { createPendingMessage } from '@/app/lib/messageHelpers'

export function useOptimisticMessages() {
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])

  const addOptimisticMessage = useCallback((content: string) => {
    const pendingMessage = createPendingMessage(content)
    setOptimisticMessages(prev => [...prev, pendingMessage])
    return pendingMessage
  }, [])

  const updateMessageStatus = useCallback((messageId: string, updates: Partial<Message>) => {
    setOptimisticMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    )
  }, [])

  const markMessageSent = useCallback((messageId: string) => {
    updateMessageStatus(messageId, { pending: false })
  }, [updateMessageStatus])

  const markMessageError = useCallback((messageId: string) => {
    updateMessageStatus(messageId, { pending: false, error: true })
  }, [updateMessageStatus])

  const markMessageRetrying = useCallback((messageId: string) => {
    updateMessageStatus(messageId, { pending: true, error: false })
  }, [updateMessageStatus])

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([])
  }, [])

  return {
    optimisticMessages,
    addOptimisticMessage,
    updateMessageStatus,
    markMessageSent,
    markMessageError,
    markMessageRetrying,
    clearOptimisticMessages
  }
}