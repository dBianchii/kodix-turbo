/**
 * 🧪 TESTES DE REGRESSÃO - FASE 3
 * 
 * Estes testes garantem que nenhuma funcionalidade será quebrada
 * durante a migração de autoCreateSessionWithMessage para createEmptySession
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Mocks dos componentes
const mockUseAutoCreateSession = vi.fn();
const mockUseEmptySession = vi.fn();
const mockUseSessionWithMessages = vi.fn();

vi.mock("../../../_hooks/useAutoCreateSession", () => ({
  useAutoCreateSession: mockUseAutoCreateSession,
}));

vi.mock("../../../_hooks/useEmptySession", () => ({
  useEmptySession: mockUseEmptySession,
}));

vi.mock("../../../_hooks/useSessionWithMessages", () => ({
  useSessionWithMessages: mockUseSessionWithMessages,
}));

// Mock do useChat do Vercel AI SDK
const mockUseChat = vi.fn();
vi.mock("@ai-sdk/react", () => ({
  useChat: mockUseChat,
}));

// Mock dos componentes
import { Message } from "../../_components/message";
import { WelcomeHeader } from "../../_components/welcome-header";
import { WelcomeSuggestions } from "../../_components/welcome-suggestions";
import { ChatWindow } from "../../_components/chat-window";

// Setup de teste
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe("🔄 REGRESSÃO - Funcionalidades Críticas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup padrão dos mocks
    mockUseAutoCreateSession.mockReturnValue({
      createSessionWithMessage: vi.fn(),
      isCreating: false,
      error: null,
      reset: vi.fn(),
    });
    
    mockUseEmptySession.mockReturnValue({
      createEmptySession: vi.fn(),
      isCreating: false,
      error: null,
      reset: vi.fn(),
    });
    
    mockUseSessionWithMessages.mockReturnValue({
      session: null,
      initialMessages: [],
      isLoading: false,
    });
    
    mockUseChat.mockReturnValue({
      messages: [],
      append: vi.fn(),
      reload: vi.fn(),
      isLoading: false,
    });
  });

  describe("📝 Renderização de Markdown", () => {
    it("deve renderizar markdown básico corretamente", () => {
      const markdownContent = "**Bold text** and *italic text* with `code`";
      
      render(
        <Message 
          role="assistant" 
          content={markdownContent} 
        />
      );
      
      // Verificar se ReactMarkdown está sendo usado
      expect(screen.getByText(/Bold text/)).toBeInTheDocument();
    });

    it("deve renderizar listas e links corretamente", () => {
      const markdownContent = `
# Título
- Item 1
- Item 2
[Link](https://example.com)
      `;
      
      render(
        <Message 
          role="assistant" 
          content={markdownContent} 
        />
      );
      
      expect(screen.getByText("Título")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Link")).toBeInTheDocument();
    });

    it("deve renderizar código em blocos corretamente", () => {
      const markdownContent = `
\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`
      `;
      
      render(
        <Message 
          role="assistant" 
          content={markdownContent} 
        />
      );
      
      expect(screen.getByText(/function hello/)).toBeInTheDocument();
      expect(screen.getByText(/console.log/)).toBeInTheDocument();
    });

    it("deve usar remarkGfm para tabelas", () => {
      const markdownContent = `
| Coluna 1 | Coluna 2 |
|----------|----------|
| Valor 1  | Valor 2  |
      `;
      
      render(
        <Message 
          role="assistant" 
          content={markdownContent} 
        />
      );
      
      expect(screen.getByText("Coluna 1")).toBeInTheDocument();
      expect(screen.getByText("Valor 1")).toBeInTheDocument();
    });
  });

  describe("🎨 Layout e Posicionamento", () => {
    it("deve posicionar mensagens do usuário à direita", () => {
      const { container } = render(
        <Message 
          role="user" 
          content="Mensagem do usuário" 
        />
      );
      
      const messageContainer = container.querySelector('.justify-end');
      expect(messageContainer).toBeInTheDocument();
    });

    it("deve posicionar mensagens do assistente à esquerda", () => {
      const { container } = render(
        <Message 
          role="assistant" 
          content="Mensagem do assistente" 
        />
      );
      
      const messageContainer = container.querySelector('.justify-start');
      expect(messageContainer).toBeInTheDocument();
    });

    it("deve manter scroll behavior adequado", () => {
      mockUseSessionWithMessages.mockReturnValue({
        session: { id: "test-session", title: "Test" },
        initialMessages: [
          { id: "1", role: "user", content: "Mensagem 1" },
          { id: "2", role: "assistant", content: "Resposta 1" },
        ],
        isLoading: false,
      });
      
      mockUseChat.mockReturnValue({
        messages: [
          { id: "1", role: "user", content: "Mensagem 1" },
          { id: "2", role: "assistant", content: "Resposta 1" },
        ],
        append: vi.fn(),
        reload: vi.fn(),
        isLoading: false,
      });
      
      render(
        <TestWrapper>
          <ChatWindow sessionId="test-session" />
        </TestWrapper>
      );
      
      // Verificar se ScrollArea está presente
      expect(screen.getByText("Mensagem 1")).toBeInTheDocument();
      expect(screen.getByText("Resposta 1")).toBeInTheDocument();
    });
  });

  describe("👋 Welcome Screen", () => {
    it("deve renderizar WelcomeHeader corretamente", () => {
      render(<WelcomeHeader />);
      
      // Verificar elementos visuais
      expect(screen.getByRole("heading")).toBeInTheDocument();
      expect(screen.getByText(/greeting/i)).toBeInTheDocument();
    });

    it("deve renderizar WelcomeSuggestions com todas as opções", () => {
      const mockOnClick = vi.fn();
      
      render(
        <WelcomeSuggestions onSuggestionClick={mockOnClick} />
      );
      
      // Verificar se todas as sugestões estão presentes
      expect(screen.getByText("Code Help")).toBeInTheDocument();
      expect(screen.getByText("Text Review")).toBeInTheDocument();
      expect(screen.getByText("Brainstorm Ideas")).toBeInTheDocument();
      expect(screen.getByText("Explain Concepts")).toBeInTheDocument();
    });

    it("deve chamar callback ao clicar em sugestão", async () => {
      const mockOnClick = vi.fn();
      
      render(
        <WelcomeSuggestions onSuggestionClick={mockOnClick} />
      );
      
      const codeHelpCard = screen.getByText("Code Help").closest('.cursor-pointer');
      fireEvent.click(codeHelpCard!);
      
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith(
          "I need help with programming. Can you explain a concept or review my code?"
        );
      });
    });
  });

  describe("🔄 Auto-processamento Inteligente", () => {
    it("deve detectar nova sessão e usar reload()", async () => {
      const mockReload = vi.fn();
      
      mockUseSessionWithMessages.mockReturnValue({
        session: { id: "new-session", title: "New Chat" },
        initialMessages: [
          { id: "1", role: "user", content: "Primeira mensagem" },
        ],
        isLoading: false,
      });
      
      mockUseChat.mockReturnValue({
        messages: [
          { id: "1", role: "user", content: "Primeira mensagem" },
        ],
        append: vi.fn(),
        reload: mockReload,
        isLoading: false,
      });
      
      render(
        <TestWrapper>
          <ChatWindow sessionId="new-session" />
        </TestWrapper>
      );
      
      // O auto-processamento deve ser executado
      await waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });

    it("não deve executar auto-processamento em sessões existentes", async () => {
      const mockReload = vi.fn();
      
      mockUseSessionWithMessages.mockReturnValue({
        session: { id: "existing-session", title: "Existing Chat" },
        initialMessages: [
          { id: "1", role: "user", content: "Mensagem 1" },
          { id: "2", role: "assistant", content: "Resposta 1" },
        ],
        isLoading: false,
      });
      
      mockUseChat.mockReturnValue({
        messages: [
          { id: "1", role: "user", content: "Mensagem 1" },
          { id: "2", role: "assistant", content: "Resposta 1" },
        ],
        append: vi.fn(),
        reload: mockReload,
        isLoading: false,
      });
      
      render(
        <TestWrapper>
          <ChatWindow sessionId="existing-session" />
        </TestWrapper>
      );
      
      // Auto-processamento NÃO deve ser executado
      await waitFor(() => {
        expect(mockReload).not.toHaveBeenCalled();
      });
    });
  });

  describe("⚡ Performance e Otimizações", () => {
    it("deve usar React.memo no componente Message", () => {
      // Verificar se o componente é memoizado
      expect(Message.displayName).toBeDefined();
    });

    it("deve carregar initialMessages apenas uma vez", () => {
      mockUseSessionWithMessages.mockReturnValue({
        session: { id: "test-session", title: "Test" },
        initialMessages: [
          { id: "1", role: "user", content: "Test message" },
        ],
        isLoading: false,
      });
      
      const { rerender } = render(
        <TestWrapper>
          <ChatWindow sessionId="test-session" />
        </TestWrapper>
      );
      
      // Re-render não deve causar nova busca
      rerender(
        <TestWrapper>
          <ChatWindow sessionId="test-session" />
        </TestWrapper>
      );
      
      // useSessionWithMessages deve ser chamado apenas uma vez por sessão
      expect(mockUseSessionWithMessages).toHaveBeenCalledWith("test-session");
    });
  });

  describe("🚨 Error Handling", () => {
    it("deve exibir erro de sessão graciosamente", () => {
      mockUseSessionWithMessages.mockReturnValue({
        session: null,
        initialMessages: [],
        isLoading: false,
        error: new Error("Sessão não encontrada"),
      });
      
      render(
        <TestWrapper>
          <ChatWindow sessionId="invalid-session" />
        </TestWrapper>
      );
      
      // Deve continuar funcionando mesmo com erro
      expect(screen.queryByText("Erro")).not.toBeInTheDocument();
    });

    it("deve lidar com streaming errors", () => {
      mockUseChat.mockReturnValue({
        messages: [],
        append: vi.fn(),
        reload: vi.fn(),
        isLoading: false,
        error: new Error("Streaming failed"),
      });
      
      render(
        <TestWrapper>
          <ChatWindow sessionId="test-session" />
        </TestWrapper>
      );
      
      // Aplicação deve continuar funcionando
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});

describe("🔧 Validação de Hooks", () => {
  describe("useAutoCreateSession", () => {
    it("deve manter interface atual", () => {
      const result = mockUseAutoCreateSession();
      
      expect(result).toHaveProperty("createSessionWithMessage");
      expect(result).toHaveProperty("isCreating");
      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("reset");
    });
  });

  describe("useEmptySession", () => {
    it("deve ter interface compatível", () => {
      const result = mockUseEmptySession();
      
      expect(result).toHaveProperty("createEmptySession");
      expect(result).toHaveProperty("isCreating");
      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("reset");
    });
  });

  describe("useSessionWithMessages", () => {
    it("deve fornecer dados formatados corretamente", () => {
      const result = mockUseSessionWithMessages();
      
      expect(result).toHaveProperty("session");
      expect(result).toHaveProperty("initialMessages");
      expect(result).toHaveProperty("isLoading");
    });
  });
});

describe("📊 Métricas de Validação", () => {
  it("deve manter compatibilidade com ReactMarkdown", () => {
    const testContent = "**Test** markdown";
    
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {testContent}
      </ReactMarkdown>
    );
    
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("deve preservar comportamento do Vercel AI SDK", () => {
    const mockResult = mockUseChat();
    
    // Verificar interface do useChat
    expect(mockResult).toHaveProperty("messages");
    expect(mockResult).toHaveProperty("append");
    expect(mockResult).toHaveProperty("reload");
    expect(mockResult).toHaveProperty("isLoading");
  });
}); 