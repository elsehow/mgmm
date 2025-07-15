# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run Storybook for component development
npm run storybook

# Build Storybook for production
npm run build-storybook
```

## Architecture Overview

This is a Next.js 14 TypeScript application implementing a date-based chat system with Anthropic's Claude AI. The app creates one conversation per day and provides intuitive date navigation.

### Core Architecture Patterns

**Date-Based Conversations**: Unlike traditional chat apps, this system creates one conversation per calendar day. Conversations are stored as `YYYY-MM-DD.json` files and automatically created when users start typing on new days.

**Dual Storage System**: The app supports both legacy UUID-based conversations and new date-based conversations. Date-based conversations use the date string as the ID (e.g., `2024-01-15`).

**Optimistic UI Updates**: Messages appear immediately in the UI while being processed server-side. Failed messages show retry buttons and can be resent.

**Streaming Responses**: AI responses stream in real-time using Server-Sent Events (SSE) from the Anthropic API.

### Key Components & Their Responsibilities

**Storage Layer (`app/lib/storage.ts`)**:
- Singleton pattern (`ConversationStorage.getInstance()`)
- Handles both legacy and date-based conversation storage
- Key methods: `getConversationByDate()`, `getAvailableDates()`, `addMessageToDateConversation()`

**Hook Architecture**:
- `useChat()`: Main orchestration hook combining all chat functionality
- `useDateNavigation()`: Manages date state and navigation between days
- `useOptimisticMessages()`: Handles optimistic UI updates for pending messages
- `useStreamingResponse()`: Manages real-time streaming AI responses

**Service Layer (`app/services/chatService.ts`)**:
- Handles API communication with date-based and legacy endpoints
- Manages SSE streaming from `/api/chat`
- Methods: `sendMessage()`, `getConversationByDate()`, `getAvailableDates()`

**Date Navigation System**:
- `DateNavigation` component provides < > navigation and "Today" button
- `app/lib/dateUtils.ts` handles date formatting and relative display ("Today", "Yesterday", "2 days ago")
- Navigation buttons are disabled when no conversation exists for that day

### API Endpoints

- `POST /api/chat` - Send messages (supports both `conversationId` and `date` parameters)
- `GET /api/conversations/dates` - Get list of dates with conversations
- `GET /api/conversations/by-date/[date]` - Get conversation for specific date
- `GET /api/conversations/[id]` - Legacy endpoint for UUID-based conversations

### Configuration System

All magic strings and constants are centralized in `app/config/constants.ts` and `app/config/enums.ts`. This includes API endpoints, error messages, UI text, CSS classes, and HTTP status codes.

### Environment Requirements

- `ANTHROPIC_API_KEY` environment variable required for AI functionality
- Conversations stored in `data/conversations/` directory (auto-created)

### Component Development

Components are built with Storybook integration. Each component has a corresponding `.stories.tsx` file. The date navigation system is the primary UI paradigm - users navigate between days rather than creating new chats.

### Error Handling

The app uses consistent error patterns across all layers with centralized error messages. Failed messages show retry buttons and maintain pending states until resolved.