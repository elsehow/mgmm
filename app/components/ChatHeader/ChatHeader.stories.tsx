import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import ChatHeader from './ChatHeader'

const meta: Meta<typeof ChatHeader> = {
  title: 'Components/ChatHeader',
  component: ChatHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onNewChat: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const CustomTitle: Story = {
  args: {
    title: 'AI Assistant',
  },
}

export const LongTitle: Story = {
  args: {
    title: 'Advanced AI Conversation Assistant',
  },
}