export const API_CONFIG = {
  ENDPOINTS: {
    CHAT: '/api/chat',
    CONVERSATIONS: '/api/conversations',
    CONVERSATION_BY_ID: (id: string) => `/api/conversations/${id}`,
  },
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    APPLICATION_JSON: 'application/json',
  },
  MODELS: {
    CLAUDE_SONNET: 'claude-sonnet-4-20250514',
  },
  USERS: {
    DEFAULT_USER_ID: 'default-user',
  },
} as const

export const UI_CONFIG = {
  CHAT: {
    DEFAULT_TITLE: 'Chat with Claude',
    DEFAULT_PLACEHOLDER: 'Type your message...',
    SCROLL_BEHAVIOR: 'smooth' as const,
  },
  STORYBOOK: {
    PORT: 6006,
  },
} as const

export const STREAM_EVENTS = {
  CONVERSATION_ID: 'conversation_id',
  CONTENT_BLOCK_DELTA: 'content_block_delta',
  DONE: '[DONE]',
} as const