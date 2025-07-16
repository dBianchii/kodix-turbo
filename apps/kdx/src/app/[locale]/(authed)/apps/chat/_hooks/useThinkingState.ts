"use client";

import { useEffect, useRef, useState } from "react";

interface UseThinkingStateProps {
  /** Whether the chat is loading/processing */
  isLoading: boolean;
  /** Whether the AI has started streaming response */
  isStreaming: boolean;
  /** Number of messages (to detect when new message is being processed) */
  messageCount: number;
  /** Delay in ms before showing thinking indicator (default: 3000ms) */
  delayBeforeThinking?: number;
}

interface UseThinkingStateReturn {
  /** Whether to show the thinking indicator */
  isThinking: boolean;
  /** How long the AI has been thinking (in seconds) */
  thinkingDuration: number;
  /** Whether the thinking has exceeded normal duration */
  isDelayed: boolean;
}

export function useThinkingState({
  isLoading,
  isStreaming,
  messageCount,
  delayBeforeThinking = 3000,
}: UseThinkingStateProps): UseThinkingStateReturn {
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingDuration, setThinkingDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(messageCount);

  // Get consistent delay for all models
  const getDelayBeforeThinking = () => {
    return delayBeforeThinking; // Use provided delay or default (3000ms)
  };

  const actualDelay = getDelayBeforeThinking();

  // Determine if this is considered a delayed response (generic threshold)
  const getDelayThreshold = () => {
    return 4; // 4 seconds threshold for all models
  };

  const isDelayed = thinkingDuration > getDelayThreshold();

  // Start thinking timer when loading starts
  useEffect(() => {
    // Start timer when we start loading a new message
    if (isLoading && messageCount > lastMessageCountRef.current) {
      // Clear any existing timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start delay timer
      timeoutRef.current = setTimeout(() => {
        setIsThinking(true);
        setStartTime(Date.now());

        // Start duration counter
        intervalRef.current = setInterval(() => {
          const currentTime = Date.now();
          const duration = Math.floor(
            (currentTime - (startTime ?? currentTime)) / 1000,
          );
          setThinkingDuration(duration);
        }, 1000);
      }, actualDelay);
    }

    // Update last message count
    lastMessageCountRef.current = messageCount;
  }, [isLoading, messageCount, actualDelay, startTime]);

  // Stop thinking when actually streaming starts or when loading stops
  useEffect(() => {
    const shouldStop = isStreaming || !isLoading;

    if (shouldStop) {
      // Clear both timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset state
      setIsThinking(false);
      setThinkingDuration(0);
      setStartTime(null);
    }
  }, [isStreaming, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isThinking,
    thinkingDuration,
    isDelayed,
  };
}
