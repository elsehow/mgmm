import { useState, useCallback, useMemo, useEffect } from 'react'
import { Message, Conversation } from '@/app/lib/types/conversation'
import { ChatService } from '@/app/services/chatService'
import { CONSOLE_MESSAGES } from '@/app/config/constants'
import { useOptimisticMessages } from './useOptimisticMessages'
import { useStreamingResponse } from './useStreamingResponse'
import { useDateNavigation } from './useDateNavigation'

const chatService = new ChatService()

export function useChat() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  const dateNavigation = useDateNavigation()
  
  const {
    optimisticMessages,
    addOptimisticMessage,
    markMessageSent,
    markMessageError,
    markMessageRetrying,
    clearOptimisticMessages
  } = useOptimisticMessages()
  
  const {
    isStreaming,
    streamingMessage,
    startStreaming,
    appendToStream,
    stopStreaming,
    resetStream
  } = useStreamingResponse()

  const allMessages = useMemo((): Message[] => {
    const conversationMessages = currentConversation?.messages || []
    return [...conversationMessages, ...optimisticMessages]
  }, [currentConversation?.messages, optimisticMessages])

  // Load conversation when date changes
  useEffect(() => {
    const loadConversation = async () => {
      const conversation = await chatService.getConversationByDate(dateNavigation.currentDateString)
      setCurrentConversation(conversation)
      clearOptimisticMessages()
    }
    
    loadConversation()
  }, [dateNavigation.currentDateString, clearOptimisticMessages])

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isStreaming) return

    const pendingMessage = addOptimisticMessage(messageContent)
    setMessage('')
    resetStream()
    startStreaming()

    try {
      let newConversationId: string | null = null

      await chatService.sendMessage(
        {
          message: messageContent,
          date: dateNavigation.currentDateString,
        },
        {
          onConversationId: (conversationId) => {
            newConversationId = conversationId
            markMessageSent(pendingMessage.id)
          },
          onContentDelta: (text) => {
            appendToStream(text)
          },
          onDone: async () => {
            stopStreaming()
            
            // Reload the conversation for the current date
            const conversation = await chatService.getConversationByDate(dateNavigation.currentDateString)
            if (conversation) {
              setCurrentConversation(conversation)
              clearOptimisticMessages()
            }
            
            // Refresh available dates
            dateNavigation.refreshAvailableDates()
          },
          onError: (error) => {
            console.error(CONSOLE_MESSAGES.ERRORS.CHAT_ERROR, error)
            stopStreaming()
            markMessageError(pendingMessage.id)
          }
        }
      )
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERRORS.SEND_MESSAGE_ERROR, error)
      stopStreaming()
      markMessageError(pendingMessage.id)
    }
  }, [
    isStreaming,
    dateNavigation.currentDateString,
    addOptimisticMessage,
    markMessageSent,
    markMessageError,
    startStreaming,
    appendToStream,
    stopStreaming,
    resetStream,
    clearOptimisticMessages,
    dateNavigation.refreshAvailableDates
  ])

  const retryMessage = useCallback(async (failedMessage: Message) => {
    if (isStreaming) return

    markMessageRetrying(failedMessage.id)
    startStreaming()
    resetStream()

    try {
      let newConversationId: string | null = null

      await chatService.sendMessage(
        {
          message: failedMessage.content,
          date: dateNavigation.currentDateString,
        },
        {
          onConversationId: (conversationId) => {
            newConversationId = conversationId
            markMessageSent(failedMessage.id)
          },
          onContentDelta: (text) => {
            appendToStream(text)
          },
          onDone: async () => {
            stopStreaming()
            
            // Reload the conversation for the current date
            const conversation = await chatService.getConversationByDate(dateNavigation.currentDateString)
            if (conversation) {
              setCurrentConversation(conversation)
              clearOptimisticMessages()
            }
            
            // Refresh available dates
            dateNavigation.refreshAvailableDates()
          },
          onError: (error) => {
            console.error(CONSOLE_MESSAGES.ERRORS.RETRY_ERROR, error)
            stopStreaming()
            markMessageError(failedMessage.id)
          }
        }
      )
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERRORS.RETRY_MESSAGE_ERROR, error)
      stopStreaming()
      markMessageError(failedMessage.id)
    }
  }, [
    isStreaming,
    dateNavigation.currentDateString,
    markMessageRetrying,
    markMessageSent,
    markMessageError,
    startStreaming,
    appendToStream,
    stopStreaming,
    resetStream,
    clearOptimisticMessages,
    dateNavigation.refreshAvailableDates
  ])


  return {
    // State
    message,
    setMessage,
    currentConversation,
    allMessages,
    isStreaming,
    streamingMessage,
    
    // Date navigation
    ...dateNavigation,
    
    // Actions
    sendMessage,
    retryMessage,
  }
}