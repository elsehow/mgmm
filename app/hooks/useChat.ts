import { useState, useCallback, useMemo } from 'react'
import { Message, Conversation } from '@/app/lib/types/conversation'
import { ChatService } from '@/app/services/chatService'
import { useOptimisticMessages } from './useOptimisticMessages'
import { useStreamingResponse } from './useStreamingResponse'

const chatService = new ChatService()

export function useChat() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  
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
          conversationId: currentConversation?.id,
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
            
            if (newConversationId) {
              const conversation = await chatService.getConversation(newConversationId)
              if (conversation) {
                setCurrentConversation(conversation)
                clearOptimisticMessages()
              }
            }
          },
          onError: (error) => {
            console.error('Chat error:', error)
            stopStreaming()
            markMessageError(pendingMessage.id)
          }
        }
      )
    } catch (error) {
      console.error('Send message error:', error)
      stopStreaming()
      markMessageError(pendingMessage.id)
    }
  }, [
    isStreaming,
    currentConversation?.id,
    addOptimisticMessage,
    markMessageSent,
    markMessageError,
    startStreaming,
    appendToStream,
    stopStreaming,
    resetStream,
    clearOptimisticMessages
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
          conversationId: currentConversation?.id,
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
            
            if (newConversationId) {
              const conversation = await chatService.getConversation(newConversationId)
              if (conversation) {
                setCurrentConversation(conversation)
                clearOptimisticMessages()
              }
            }
          },
          onError: (error) => {
            console.error('Retry error:', error)
            stopStreaming()
            markMessageError(failedMessage.id)
          }
        }
      )
    } catch (error) {
      console.error('Retry message error:', error)
      stopStreaming()
      markMessageError(failedMessage.id)
    }
  }, [
    isStreaming,
    currentConversation?.id,
    markMessageRetrying,
    markMessageSent,
    markMessageError,
    startStreaming,
    appendToStream,
    stopStreaming,
    resetStream,
    clearOptimisticMessages
  ])

  const startNewConversation = useCallback(() => {
    setCurrentConversation(null)
    clearOptimisticMessages()
    stopStreaming()
  }, [clearOptimisticMessages, stopStreaming])

  return {
    // State
    message,
    setMessage,
    currentConversation,
    allMessages,
    isStreaming,
    streamingMessage,
    
    // Actions
    sendMessage,
    retryMessage,
    startNewConversation,
  }
}