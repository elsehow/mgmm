'use client'

import { useEffect, useRef, FormEvent } from 'react'
import { useChat } from './hooks/useChat'
import { createStreamingMessage } from './lib/messageHelpers'
import ChatHeader from './components/ChatHeader/ChatHeader'
import ChatMessage from './components/ChatMessage/ChatMessage'
import ChatInput from './components/ChatInput/ChatInput'

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    message,
    setMessage,
    allMessages,
    isStreaming,
    streamingMessage,
    sendMessage,
    retryMessage,
    currentDate,
    availableDates,
    navigateDirection,
    goToToday,
  } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, streamingMessage])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(message)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader 
        currentDate={currentDate}
        availableDates={availableDates}
        onNavigate={navigateDirection}
        onGoToToday={goToToday}
      />

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {allMessages.map((msg) => (
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

      <footer className="border-t bg-white p-4">
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