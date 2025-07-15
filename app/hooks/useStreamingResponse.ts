import { useState, useCallback } from 'react'

export function useStreamingResponse() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')

  const startStreaming = useCallback(() => {
    setIsStreaming(true)
    setStreamingMessage('')
  }, [])

  const appendToStream = useCallback((text: string) => {
    setStreamingMessage(prev => prev + text)
  }, [])

  const stopStreaming = useCallback(() => {
    setIsStreaming(false)
    setStreamingMessage('')
  }, [])

  const resetStream = useCallback(() => {
    setStreamingMessage('')
  }, [])

  return {
    isStreaming,
    streamingMessage,
    startStreaming,
    appendToStream,
    stopStreaming,
    resetStream
  }
}