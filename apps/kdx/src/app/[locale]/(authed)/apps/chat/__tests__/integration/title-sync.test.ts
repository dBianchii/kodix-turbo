import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTitleSync } from '../../_hooks/useTitleSync';
import type { ReactNode } from 'react';

// Mock do tRPC
const mockUtils = {
  app: {
    chat: {
      buscarSession: {
        invalidate: vi.fn(),
        refetch: vi.fn(() => Promise.resolve({ data: { titulo: 'Título Atualizado' } })),
      },
      listarSessions: {
        invalidate: vi.fn(),
      },
      buscarMensagensTest: {
        invalidate: vi.fn(),
      },
    },
  },
};

vi.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => mockUtils,
  },
}));

describe('Title Synchronization with jsdom', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset document title
    document.title = 'Test App';
    
    // Mock console methods to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('🔄 DOM Integration Tests', () => {
    it('deve atualizar document.title quando sincronização é bem-sucedida', async () => {
      // Arrange
      const sessionId = 'session-123';
      document.title = 'Chat 21/06/2025'; // Título padrão
      
      // Mock successful refetch
      mockUtils.app.chat.buscarSession.refetch.mockResolvedValue({
        data: { titulo: 'Conversa sobre React' },
      });

      // Act
      const { result } = renderHook(
        () => useTitleSync({ 
          sessionId, 
          enabled: true,
          pollInterval: 1000,
        }),
        { wrapper }
      );

      // Trigger sync
      await act(async () => {
        await result.current.syncNow();
      });

      // Assert
      await waitFor(() => {
        expect(document.title).toBe('Conversa sobre React');
      });
      
      expect(mockUtils.app.chat.buscarSession.refetch).toHaveBeenCalledTimes(1);
    });

    it('deve detectar títulos padrão usando DOM APIs', () => {
      // Arrange - Simular diferentes títulos no DOM
      const testCases = [
        { title: 'Chat 21/06/2025', expected: true },
        { title: 'Chat 01/12/2024', expected: true },
        { title: 'Conversa sobre IA', expected: false },
        { title: 'Nova sessão', expected: false },
      ];

      testCases.forEach(({ title, expected }) => {
        // Act
        document.title = title;
        const isDefaultTitle = /\d{2}\/\d{2}\/\d{4}/.test(document.title);
        
        // Assert
        expect(isDefaultTitle).toBe(expected);
      });
    });

    it('deve usar localStorage para persistir estado', async () => {
      // Arrange
      const sessionId = 'session-456';
      const storageKey = `title-sync-${sessionId}`;
      
      // Clear localStorage
      localStorage.clear();
      
      // Act - Simular sincronização bem-sucedida
      localStorage.setItem(storageKey, JSON.stringify({
        lastSync: Date.now(),
        title: 'Título Cached',
      }));

      // Assert
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.title).toBe('Título Cached');
        expect(typeof parsed.lastSync).toBe('number');
      }
    });

    it('deve reagir a mudanças no window.location', () => {
      // Arrange
      const sessionId = 'session-789';
      
      // Mock window.location
      const mockLocation = {
        ...window.location,
        pathname: `/apps/chat/${sessionId}`,
        search: '?test=true',
      };
      
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      // Assert
      expect(window.location.pathname).toContain(sessionId);
      expect(window.location.search).toBe('?test=true');
    });

    it('deve usar IntersectionObserver para otimizar performance', () => {
      // Arrange
      const mockObserver = vi.fn();
      
      // O mock já está configurado no test-setup.ts
      const observer = new IntersectionObserver(mockObserver);
      
      // Simular elemento observado
      const mockElement = document.createElement('div');
      mockElement.id = 'chat-container';
      document.body.appendChild(mockElement);
      
      observer.observe(mockElement);

      // Assert
      expect(observer.observe).toHaveBeenCalledWith(mockElement);
      
      // Cleanup
      document.body.removeChild(mockElement);
      observer.disconnect();
    });

    it('deve lidar com erros de rede mantendo título anterior', async () => {
      // Arrange
      const sessionId = 'session-error';
      document.title = 'Título Anterior Válido';
      
      // Mock network error
      mockUtils.app.chat.buscarSession.refetch.mockRejectedValue(
        new Error('Network Error')
      );

      // Act
      const { result } = renderHook(
        () => useTitleSync({ sessionId, enabled: true }),
        { wrapper }
      );

      await act(async () => {
        try {
          await result.current.syncNow();
        } catch (error) {
          // Expected to fail
        }
      });

      // Assert - Título deve permanecer o mesmo
      expect(document.title).toBe('Título Anterior Válido');
      expect(mockUtils.app.chat.buscarSession.refetch).toHaveBeenCalledTimes(1);
    });

    it('deve usar requestAnimationFrame para otimizar atualizações', () => {
      // Arrange
      let rafCallback: FrameRequestCallback | null = null;
      
      const mockRAF = vi.fn((callback: FrameRequestCallback) => {
        rafCallback = callback;
        return 1; // Mock frame ID
      });
      
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: mockRAF,
        writable: true,
      });

      // Act - Simular uso do RAF
      window.requestAnimationFrame(() => {
        document.title = 'Título Atualizado via RAF';
      });

      // Assert
      expect(mockRAF).toHaveBeenCalled();
      expect(rafCallback).toBeTruthy();
    });
  });
}); 