// Message-related enums
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum MessageState {
  PENDING = 'pending',
  ERROR = 'error',
  NORMAL = 'normal',
}

export enum MessageStatus {
  SENDING = 'Sending...',
  FAILED = 'Failed',
  SEND = 'Send',
}

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// Stream Event Types
export enum StreamEventType {
  CONVERSATION_ID = 'conversation_id',
  CONTENT_BLOCK_DELTA = 'content_block_delta',
  DONE = '[DONE]',
}

// Layout Types
export enum LayoutType {
  PADDED = 'padded',
  CENTERED = 'centered',
}

// Storage Error Codes
export enum StorageErrorCode {
  FILE_NOT_FOUND = 'ENOENT',
}

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}