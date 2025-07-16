import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import ChatHeader from '../ChatHeader/ChatHeader'
import ChatMessage from '../ChatMessage/ChatMessage'
import ChatInput from '../ChatInput/ChatInput'
import { Message } from '@/app/lib/types/conversation'
import { createStreamingMessage } from '@/app/lib/messageHelpers'

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello! Can you help me understand how React hooks work?',
    timestamp: new Date('2024-01-15T10:00:00'),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Of course! React hooks are functions that let you use state and other React features in functional components. The most common hooks are useState and useEffect.',
    timestamp: new Date('2024-01-15T10:01:00'),
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you show me an example?',
    timestamp: new Date('2024-01-15T10:02:00'),
  },
  {
    id: '4',
    role: 'assistant',
    content: `Here's a simple example:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

The useState hook returns an array with the current state value and a function to update it.`,
    timestamp: new Date('2024-01-15T10:03:00'),
  },
]

const availableDates = ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12']

function FullChatComponent() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [currentDate] = useState(new Date('2024-01-15T10:00:00'))
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: String(messages.length + 1),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Simulate streaming response
    setIsStreaming(true)
    setStreamingMessage('')
    
    const response = "That's a great question! Let me help you with that..."
    let currentResponse = ''
    let index = 0

    const streamInterval = setInterval(() => {
      if (index < response.length) {
        currentResponse += response[index]
        setStreamingMessage(currentResponse)
        index++
      } else {
        clearInterval(streamInterval)
        
        const assistantMessage: Message = {
          id: String(messages.length + 2),
          role: 'assistant',
          content: currentResponse,
          timestamp: new Date(),
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsStreaming(false)
        setStreamingMessage('')
      }
    }, 50)
  }

  const handleNavigation = (direction: 'prev' | 'next') => {
    console.log(`Navigate ${direction}`)
  }

  const handleGoToToday = () => {
    console.log('Go to today')
  }

  const handleRetry = (failedMessage: Message) => {
    console.log('Retry message:', failedMessage.id)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader
        currentDate={currentDate}
        availableDates={availableDates}
        onNavigate={handleNavigation}
        onGoToToday={handleGoToToday}
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onRetry={handleRetry}
            />
          ))}
          
          {isStreaming && streamingMessage && (
            <ChatMessage 
              message={createStreamingMessage(streamingMessage)} 
            />
          )}
        </div>
      </main>
      
      <footer className="border-t bg-white p-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={isStreaming}
        />
      </footer>
    </div>
  )
}

// Empty chat component
function EmptyChat() {
  const [inputValue, setInputValue] = useState('')
  const [currentDate] = useState(new Date('2024-01-16T10:00:00'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit:', inputValue)
    setInputValue('')
  }

  const handleNavigation = (direction: 'prev' | 'next') => {
    console.log(`Navigate ${direction}`)
  }

  const handleGoToToday = () => {
    console.log('Go to today')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader
        currentDate={currentDate}
        availableDates={availableDates}
        onNavigate={handleNavigation}
        onGoToToday={handleGoToToday}
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start a conversation below</p>
          </div>
        </div>
      </main>
      
      <footer className="border-t bg-white p-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={false}
        />
      </footer>
    </div>
  )
}

const meta: Meta<typeof FullChatComponent> = {
  title: 'Components/FullChat',
  component: FullChatComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <FullChatComponent />,
}

export const Empty: Story = {
  render: () => <EmptyChat />,
}

export const WithFailedMessage: Story = {
  render: () => {
    const messagesWithError: Message[] = [
      ...mockMessages,
      {
        id: '5',
        role: 'user',
        content: 'Can you explain custom hooks?',
        timestamp: new Date('2024-01-15T10:06:00'),
        error: true,
      },
    ]

    const [messages] = useState<Message[]>(messagesWithError)
    const [inputValue, setInputValue] = useState('')
    const [currentDate] = useState(new Date('2024-01-15T10:00:00'))

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Submit:', inputValue)
      setInputValue('')
    }

    const handleNavigation = (direction: 'prev' | 'next') => {
      console.log(`Navigate ${direction}`)
    }

    const handleGoToToday = () => {
      console.log('Go to today')
    }

    const handleRetry = (failedMessage: Message) => {
      console.log('Retry message:', failedMessage.id)
    }

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <ChatHeader
          currentDate={currentDate}
          availableDates={availableDates}
          onNavigate={handleNavigation}
          onGoToToday={handleGoToToday}
        />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </main>
        
        <footer className="border-t bg-white p-4">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={false}
          />
        </footer>
      </div>
    )
  },
}