require('@testing-library/jest-dom')

// Mock Next.js environment variables
process.env.NODE_ENV = 'test'

// Global test utilities
global.createMockDate = (dateString) => {
  return new Date(dateString + 'T00:00:00.000Z')
}

global.createMockConversation = (id, date, messages = []) => {
  return {
    id,
    messages,
    createdAt: date,
    updatedAt: date,
  }
}

global.createMockMessage = (id, role, content, timestamp = new Date()) => {
  return {
    id,
    role,
    content,
    timestamp,
  }
}