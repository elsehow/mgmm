'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { Message, Conversation } from './lib/types/conversation'

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

    const pendingMessage: Message = {
      id: `pending-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      pending: true,
      localOnly: true
    }

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

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Chat with Claude</h1>
        <button onClick={startNewConversation} className="new-chat-btn">
          New Chat
        </button>
      </header>

      <main className="chat-main">
        <div className="messages-container">
          {getAllMessages().map((msg) => (
            <div key={msg.id} className={`message ${msg.role} ${msg.pending ? 'pending' : ''} ${msg.error ? 'error' : ''}`}>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {msg.pending ? 'Sending...' : msg.error ? 'Failed' : formatTimestamp(msg.timestamp)}
                  {msg.error && (
                    <button 
                      onClick={() => retryMessage(msg)}
                      className="retry-button"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isStreaming && streamingMessage && (
            <div className="message assistant">
              <div className="message-content">
                <div className="message-text">{streamingMessage}</div>
                <div className="message-time">Now</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-footer">
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="chat-input"
          />
          <button 
            type="submit" 
            disabled={isStreaming || !message.trim()}
            className="chat-submit"
          >
            {isStreaming ? 'Sending...' : 'Send'}
          </button>
        </form>
      </footer>
    </div>
  )
}