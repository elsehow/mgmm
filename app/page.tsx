'use client'

import { useEffect, useRef, FormEvent } from 'react'
import { useChat } from './hooks/useChat'
import { createStreamingMessage } from './lib/messageHelpers'
import { UI_CONFIG, CSS_CLASSES } from './config/constants'
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
    startNewConversation,
  } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: UI_CONFIG.CHAT.SCROLL_BEHAVIOR })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, streamingMessage])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(message)
  }

  return (
    <div className={CSS_CLASSES.CHAT_CONTAINER}>
      <ChatHeader onNewChat={startNewConversation} />

      <main className={CSS_CLASSES.CHAT_MAIN}>
        <div className={CSS_CLASSES.MESSAGES_CONTAINER}>
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

      <footer className={CSS_CLASSES.CHAT_FOOTER}>
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