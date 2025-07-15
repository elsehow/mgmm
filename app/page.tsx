'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { Message, Conversation } from './lib/types/conversation'
import { createPendingMessage, createStreamingMessage } from './lib/messageHelpers'
import ChatHeader from './components/ChatHeader/ChatHeader'
import ChatMessage from './components/ChatMessage/ChatMessage'
import ChatInput from './components/ChatInput/ChatInput'

export default function Home() {
  const [message, setMessage] = useState('')
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages, optimisticMessages, streamingMessage])

  const getAllMessages = (): Message[] => {
    const conversationMessages = currentConversation?.messages || []
    return [...conversationMessages, ...optimisticMessages]
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setStreamingMessage('')
    setIsStreaming(true)

    const pendingMessage = createPendingMessage(userMessage)

    setOptimisticMessages(prev => [...prev, pendingMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          conversationId: currentConversation?.id,
          userId: 'default-user'
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === pendingMessage.id 
            ? { ...msg, pending: false }
            : msg
        )
      )

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let newConversationId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              setIsStreaming(false)
              setStreamingMessage('')
              
              if (newConversationId) {
                const convRes = await fetch(`/api/conversations/${newConversationId}`)
                if (convRes.ok) {
                  const { conversation } = await convRes.json()
                  setCurrentConversation(conversation)
                  setOptimisticMessages([])
                }
              }
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'conversation_id') {
                newConversationId = parsed.conversationId
                if (!currentConversation) {
                  const convRes = await fetch(`/api/conversations/${newConversationId}`)
                  if (convRes.ok) {
                    const { conversation } = await convRes.json()
                    setCurrentConversation(conversation)
                    setOptimisticMessages([])
                  }
                }
              } else if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                setStreamingMessage(prev => prev + parsed.delta.text)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setIsStreaming(false)
      setStreamingMessage('')
      
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === pendingMessage.id 
            ? { ...msg, pending: false, error: true }
            : msg
        )
      )
    }
  }

  const retryMessage = async (failedMessage: Message) => {
    if (isStreaming) return
    
    setOptimisticMessages(prev => 
      prev.map(msg => 
        msg.id === failedMessage.id 
          ? { ...msg, pending: true, error: false }
          : msg
      )
    )
    
    setIsStreaming(true)
    setStreamingMessage('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: failedMessage.content, 
          conversationId: currentConversation?.id,
          userId: 'default-user'
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === failedMessage.id 
            ? { ...msg, pending: false }
            : msg
        )
      )

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let newConversationId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              setIsStreaming(false)
              setStreamingMessage('')
              
              if (newConversationId) {
                const convRes = await fetch(`/api/conversations/${newConversationId}`)
                if (convRes.ok) {
                  const { conversation } = await convRes.json()
                  setCurrentConversation(conversation)
                  setOptimisticMessages([])
                }
              }
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'conversation_id') {
                newConversationId = parsed.conversationId
                if (!currentConversation) {
                  const convRes = await fetch(`/api/conversations/${newConversationId}`)
                  if (convRes.ok) {
                    const { conversation } = await convRes.json()
                    setCurrentConversation(conversation)
                    setOptimisticMessages([])
                  }
                }
              } else if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                setStreamingMessage(prev => prev + parsed.delta.text)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setIsStreaming(false)
      setStreamingMessage('')
      
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === failedMessage.id 
            ? { ...msg, pending: false, error: true }
            : msg
        )
      )
    }
  }

  const startNewConversation = () => {
    setCurrentConversation(null)
    setOptimisticMessages([])
    setStreamingMessage('')
  }

  return (
    <div className="chat-container">
      <ChatHeader onNewChat={startNewConversation} />

      <main className="chat-main">
        <div className="messages-container">
          {getAllMessages().map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg}
              onRetry={retryMessage}
            />
          ))}
          
          {isStreaming && streamingMessage && (
            <ChatMessage message={createStreamingMessage(streamingMessage)} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-footer">
        <ChatInput
          value={message}
          onChange={setMessage}
          onSubmit={handleSubmit}
          disabled={isStreaming}
        />
      </footer>
    </div>
  )
}