'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ChatMessage, ParsingResult } from '@/types/chat';
import { parseKakaoTalkTextWithDiag, ParseDiagnosticInfo } from '@/lib/kakaotalkParser';
import { calculateChatStats } from '@/lib/statsCalculator';
import { SAMPLE_KAKAOTALK_LOG } from '@/lib/sampleData';

interface ChatDataContextType {
  allMessages: ChatMessage[];
  parsingResult: ParsingResult | null;
  parseDiag: ParseDiagnosticInfo | null;
  activeFileName: string;
  isLoading: boolean;
  isUserUploaded: boolean;
  processChatText: (rawText: string, fileName: string, isFromUpload?: boolean) => void;
  clearData: () => void;
}

const ChatDataContext = createContext<ChatDataContextType | undefined>(undefined);

export function ChatDataProvider({ children }: { children: React.ReactNode }) {
  // Pre-calculate fixed immutable initial sample data (containing 박프론트, 이디자인, 최백엔드)
  const initialSample = useMemo(() => {
    const { messages, diag } = parseKakaoTalkTextWithDiag(SAMPLE_KAKAOTALK_LOG);
    const result = calculateChatStats(messages);
    return {
      messages,
      diag,
      result,
      fileName: 'kakaotalk_sample_1week.txt',
    };
  }, []);

  // User uploaded state (separated from fixed sample data)
  const [isUserUploaded, setIsUserUploaded] = useState<boolean>(false);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  const [userResult, setUserResult] = useState<ParsingResult | null>(null);
  const [userDiag, setUserDiag] = useState<ParseDiagnosticInfo | null>(null);
  const [userFileName, setUserFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Rehydrate state from localStorage on mount and sync across windows/tabs
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const cachedText = localStorage.getItem('kount_cached_chat_text');
        const cachedFileName = localStorage.getItem('kount_active_filename');

        if (cachedText && cachedFileName) {
          const { messages, diag } = parseKakaoTalkTextWithDiag(cachedText);
          const result = calculateChatStats(messages);
          setUserMessages(messages);
          setUserDiag(diag);
          setUserResult(result);
          setUserFileName(cachedFileName);
          setIsUserUploaded(true);
        } else {
          setIsUserUploaded(false);
          setUserMessages([]);
          setUserResult(null);
          setUserDiag(null);
          setUserFileName('');
        }
      } catch (err) {
        console.warn('Failed to load cached chat data from storage:', err);
      }
    };

    loadFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kount_cached_chat_text' || e.key === 'kount_active_filename') {
        loadFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Active getters: Return user uploaded data if uploaded, otherwise return fixed sample data
  const allMessages = isUserUploaded ? userMessages : initialSample.messages;
  const parsingResult = isUserUploaded ? userResult : initialSample.result;
  const parseDiag = isUserUploaded ? userDiag : initialSample.diag;
  const activeFileName = isUserUploaded ? userFileName : initialSample.fileName;

  const processChatText = (rawText: string, fileName: string, isFromUpload: boolean = false) => {
    setIsLoading(true);

    setTimeout(() => {
      try {
        const { messages, diag } = parseKakaoTalkTextWithDiag(rawText);
        const result = calculateChatStats(messages);

        if (isFromUpload) {
          setUserMessages(messages);
          setUserDiag(diag);
          setUserResult(result);
          setUserFileName(fileName);
          setIsUserUploaded(true);

          if (rawText.length < 15000000) {
            try {
              localStorage.setItem('kount_active_filename', fileName);
              localStorage.setItem('kount_cached_chat_text', rawText);
            } catch {
              // Ignore storage full errors
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse chat data:', err);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const clearData = () => {
    setIsUserUploaded(false);
    setUserMessages([]);
    setUserResult(null);
    setUserDiag(null);
    setUserFileName('');
    try {
      localStorage.removeItem('kount_active_filename');
      localStorage.removeItem('kount_cached_chat_text');
    } catch {
      // Ignore
    }
  };

  return (
    <ChatDataContext.Provider
      value={{
        allMessages,
        parsingResult,
        parseDiag,
        activeFileName,
        isLoading,
        isUserUploaded,
        processChatText,
        clearData,
      }}
    >
      {children}
    </ChatDataContext.Provider>
  );
}

export function useChatData() {
  const context = useContext(ChatDataContext);
  if (!context) {
    throw new Error('useChatData must be used within a ChatDataProvider');
  }
  return context;
}
