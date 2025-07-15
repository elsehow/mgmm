import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import ChatInput from './ChatInput'

const meta: Meta<typeof ChatInput> = {
  title: 'Components/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Type your message...',
  },
}

export const WithText: Story = {
  args: {
    value: 'Hello, how are you?',
    placeholder: 'Type your message...',
  },
}

export const Disabled: Story = {
  args: {
    value: 'This message is being sent...',
    disabled: true,
    placeholder: 'Type your message...',
  },
}

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Ask me anything...',
  },
}