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
  },
}

export const WithText: Story = {
  args: {
    value: 'Hello, how are you?',
  },
}

export const Disabled: Story = {
  args: {
    value: 'This message is being sent...',
    disabled: true,
  },
}

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Ask me anything...',
  },
}