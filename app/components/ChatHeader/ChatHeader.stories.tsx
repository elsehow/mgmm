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
    onNavigate: fn(),
    onGoToToday: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockAvailableDates = [
  '2024-01-10',
  '2024-01-11',
  '2024-01-12',
  '2024-01-13',
  '2024-01-14',
  '2024-01-15',
]

export const Today: Story = {
  args: {
    currentDate: new Date(),
    availableDates: mockAvailableDates,
  },
}

export const Yesterday: Story = {
  args: {
    currentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    availableDates: mockAvailableDates,
  },
}

export const OlderDate: Story = {
  args: {
    currentDate: new Date('2024-01-10'),
    availableDates: mockAvailableDates,
  },
}

export const FirstDate: Story = {
  args: {
    currentDate: new Date('2024-01-10'),
    availableDates: ['2024-01-10', '2024-01-11', '2024-01-12'],
  },
}

export const LastDate: Story = {
  args: {
    currentDate: new Date('2024-01-12'),
    availableDates: ['2024-01-10', '2024-01-11', '2024-01-12'],
  },
}

export const NoAvailableDates: Story = {
  args: {
    currentDate: new Date(),
    availableDates: [],
  },
}