import type { Meta, StoryObj } from '@storybook/react'
import DateNavigation from './DateNavigation'

const meta: Meta<typeof DateNavigation> = {
  title: 'Components/DateNavigation',
  component: DateNavigation,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
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
    onNavigate: (direction) => console.log('Navigate:', direction),
    onGoToToday: () => console.log('Go to today'),
  },
}

export const Yesterday: Story = {
  args: {
    currentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    availableDates: mockAvailableDates,
    onNavigate: (direction) => console.log('Navigate:', direction),
    onGoToToday: () => console.log('Go to today'),
  },
}

export const OlderDate: Story = {
  args: {
    currentDate: new Date('2024-01-10'),
    availableDates: mockAvailableDates,
    onNavigate: (direction) => console.log('Navigate:', direction),
    onGoToToday: () => console.log('Go to today'),
  },
}

export const FirstDate: Story = {
  args: {
    currentDate: new Date('2024-01-10'),
    availableDates: ['2024-01-10', '2024-01-11', '2024-01-12'],
    onNavigate: (direction) => console.log('Navigate:', direction),
    onGoToToday: () => console.log('Go to today'),
  },
}

export const LastDate: Story = {
  args: {
    currentDate: new Date('2024-01-12'),
    availableDates: ['2024-01-10', '2024-01-11', '2024-01-12'],
    onNavigate: (direction) => console.log('Navigate:', direction),
    onGoToToday: () => console.log('Go to today'),
  },
}

export const NoAvailableDates: Story = {
  args: {
    currentDate: new Date(),
    availableDates: [],
    onNavigate: (direction) => console.log('Navigate:', direction),
    onGoToToday: () => console.log('Go to today'),
  },
}