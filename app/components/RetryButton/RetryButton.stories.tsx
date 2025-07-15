import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import RetryButton from './RetryButton'

const meta: Meta<typeof RetryButton> = {
  title: 'Components/RetryButton',
  component: RetryButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}