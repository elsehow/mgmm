import type { Meta, StoryObj } from '@storybook/react'
import ChatMessage from './ChatMessage'
import { Message } from '@/app/lib/types/conversation'

const meta: Meta<typeof ChatMessage> = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const baseMessage: Message = {
  id: '1',
  content: 'Hello, how are you?',
  timestamp: new Date('2024-01-01T10:00:00'),
  role: 'user',
}

export const UserMessage: Story = {
  args: {
    message: baseMessage,
  },
}

export const AssistantMessage: Story = {
  args: {
    message: {
      ...baseMessage,
      id: '2',
      role: 'assistant',
      content: 'I am doing well, thank you for asking! How can I help you today?',
    },
  },
}

export const PendingMessage: Story = {
  args: {
    message: {
      ...baseMessage,
      id: '3',
      pending: true,
      localOnly: true,
    },
  },
}

export const ErrorMessage: Story = {
  args: {
    message: {
      ...baseMessage,
      id: '4',
      error: true,
      localOnly: true,
    },
    onRetry: () => console.log('Retry clicked'),
  },
}

export const LongMessage: Story = {
  args: {
    message: {
      ...baseMessage,
      id: '5',
      role: 'assistant',
      content: 'This is a very long message that demonstrates how the chat bubble handles text wrapping. It contains multiple sentences and should wrap nicely within the constraints of the message bubble. The message should remain readable and well-formatted even with longer content.',
    },
  },
}