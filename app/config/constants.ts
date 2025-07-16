// API Configuration
export const API_CONFIG = {
  ENDPOINTS: {
    CHAT: '/api/chat',
    CONVERSATIONS: '/api/conversations',
  },
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    APPLICATION_JSON: 'application/json',
    CACHE_CONTROL: 'Cache-Control',
    CONNECTION: 'Connection',
  },
  MODELS: {
    CLAUDE_SONNET: 'claude-sonnet-4-20250514',
  },
  LIMITS: {
    MAX_TOKENS: 1024,
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  MESSAGE_REQUIRED: 'Message is required',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  ERROR_RETRIEVING_CONVERSATION: 'Error retrieving conversation',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NO_READER_AVAILABLE: 'No reader available',
  FAILED_TO_SEND_MESSAGE: 'Failed to send message',
  HTTP_ERROR: (status: number) => `HTTP error! status: ${status}`,
} as const

// UI Configuration
export const UI_CONFIG = {
  CHAT: {
    DEFAULT_TITLE: 'Chat with Claude',
    DEFAULT_PLACEHOLDER: 'Type your message...',
    SCROLL_BEHAVIOR: 'smooth' as const,
  },
  STORYBOOK: {
    PORT: 6006,
  },
  LAYOUT: {
    PADDED: 'padded',
    CENTERED: 'centered',
  },
} as const

// Message States
export const MESSAGE_STATES = {
  PENDING: 'pending',
  ERROR: 'error',
  SENDING: 'Sending...',
  FAILED: 'Failed',
  SEND: 'Send',
} as const

// Message Roles
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const

// Stream Events
export const STREAM_EVENTS = {
  CONVERSATION_ID: 'conversation_id',
  CONTENT_BLOCK_DELTA: 'content_block_delta',
  DONE: '[DONE]',
  DATA_PREFIX: 'data: ',
} as const

// Storage Configuration
export const STORAGE_CONFIG = {
  DIRECTORY: 'data',
  SUBDIRECTORY: 'conversations',
  FILE_EXTENSION: '.json',
  ENCODING: 'utf8' as const,
  JSON_SPACING: 2,
  ERROR_CODES: {
    FILE_NOT_FOUND: 'ENOENT',
  },
} as const

// Date/Time Formatting
export const DATE_FORMAT = {
  TIME_OPTIONS: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  },
} as const

// Streaming Configuration
export const STREAMING_CONFIG = {
  RESPONSE_HEADERS: {
    CONTENT_TYPE: 'text/event-stream',
    CACHE_CONTROL: 'no-cache',
    CONNECTION: 'keep-alive',
  },
  DATA_SLICE_INDEX: 6, // for 'data: '.length
  LINE_SEPARATOR: '\n',
  DONE_EVENT: 'data: [DONE]\\n\\n',
} as const

// Storybook Configuration
export const STORYBOOK_CONFIG = {
  TITLES: {
    CHAT_HEADER: 'Components/ChatHeader',
    CHAT_INPUT: 'Components/ChatInput',
    CHAT_MESSAGE: 'Components/ChatMessage',
    RETRY_BUTTON: 'Components/RetryButton',
  },
  TAGS: {
    AUTODOCS: 'autodocs',
  },
} as const

// Console Messages
export const CONSOLE_MESSAGES = {
  ERRORS: {
    CHAT_ERROR: 'Chat error:',
    RETRY_ERROR: 'Retry error:',
    SEND_MESSAGE_ERROR: 'Send message error:',
    RETRY_MESSAGE_ERROR: 'Retry message error:',
    ERROR_IN_CHAT_ROUTE: 'Error in chat route:',
    ERROR_FETCHING_CONVERSATION: 'Error fetching conversation:',
    ERROR_FETCHING_CONVERSATIONS: 'Error fetching conversations:',
    ERROR_PARSING_SSE_DATA: 'Error parsing SSE data:',
    ERROR_READING_CONVERSATIONS_DIR: 'Error reading conversations directory:',
  },
  ACTIONS: {
    RETRY_CLICKED: 'Retry clicked',
  },
} as const

// Test Data (for Storybook)
export const TEST_DATA = {
  MESSAGES: {
    SAMPLE_QUESTION: 'Hello, how are you?',
    SAMPLE_ANSWER: 'I am doing well, thank you for asking! How can I help you today?',
    LONG_MESSAGE: 'This is a very long message that demonstrates how the chat bubble handles text wrapping. It contains multiple sentences and should wrap nicely within the constraints of the message bubble. The message should remain readable and well-formatted even with longer content.',
    SENDING_MESSAGE: 'This message is being sent...',
  },
  PLACEHOLDERS: {
    ASK_ANYTHING: 'Ask me anything...',
  },
  TIMESTAMPS: {
    SAMPLE_DATE: '2024-01-01T10:00:00',
  },
  TITLES: {
    AI_ASSISTANT: 'AI Assistant',
    ADVANCED_AI: 'Advanced AI Conversation Assistant',
  },
} as const