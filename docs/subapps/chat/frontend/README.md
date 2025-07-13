<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: subapp
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: frontend
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Chat Frontend

Frontend implementation documentation for the Chat SubApp, including real-time UI components, message rendering, and user interaction patterns.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Chat frontend provides the user interface for real-time messaging, chat rooms, and communication features within the Kodix platform.

### Core Features
- **Real-time Messaging**: Live chat with WebSocket connectivity
- **Chat Rooms**: Channel-based communication
- **Message History**: Scrollable chat history with pagination
- **Rich Media**: Image, file, and emoji support
- **User Presence**: Online indicators and typing status

## 🏗️ 🏗️ Component Architecture

### Page Components
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Main chat page
export default function ChatPage() {
  return (
    <div className="flex h-full">
      <ChatSidebar />
      <main className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </main>
    </div>
  );
}

// Chat room component
export function ChatRoom({ roomId }: { roomId: string }) {
  const { data: messages } = useChatMessages(roomId);
  const { isConnected, sendMessage } = useWebSocket(roomId);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Component Structure
```
components/
├── chat/
│   ├── ChatSidebar.tsx
│   ├── ChatHeader.tsx
│   ├── ChatMessages.tsx
│   ├── ChatInput.tsx
│   └── MessageComposer.tsx
├── messages/
│   ├── MessageList.tsx
│   ├── MessageItem.tsx
│   ├── MessageContent.tsx
│   ├── MessageReactions.tsx
│   └── MessageAttachments.tsx
├── rooms/
│   ├── RoomList.tsx
│   ├── RoomItem.tsx
│   ├── CreateRoomDialog.tsx
│   └── RoomSettings.tsx
└── presence/
    ├── UserPresence.tsx
    ├── TypingIndicator.tsx
    └── OnlineUsers.tsx
```

## 🎨 UI Design Patterns

### Message Components
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function MessageItem({ message }: { message: ChatMessage }) {
  const { user } = useAuth();
  const isOwnMessage = message.userId === user.id;
  
  return (
    <div className={cn(
      "flex mb-4",
      isOwnMessage ? "justify-end" : "justify-start"
    )}>
      {!isOwnMessage && <UserAvatar user={message.user} />}
      
      <div className={cn(
        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
        isOwnMessage 
          ? "bg-blue-500 text-white ml-auto" 
          : "bg-gray-200 text-gray-900"
      )}>
        {!isOwnMessage && (
          <p className="text-sm font-medium mb-1">{message.user.name}</p>
        )}
        
        <MessageContent content={message.content} type={message.type} />
        
        {message.attachments && (
          <MessageAttachments attachments={message.attachments} />
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-70">
            {formatMessageTime(message.createdAt)}
          </span>
          
          {message.edited && (
            <span className="text-xs opacity-70">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Real-time Input
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const { sendTypingIndicator } = useWebSocket();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    
    await onSend({
      content: message,
      attachments: await uploadAttachments(attachments)
    });
    
    setMessage('');
    setAttachments([]);
    setIsTyping(false);
  };
  
  const handleTyping = useCallback(
    debounce((isTyping: boolean) => {
      sendTypingIndicator(isTyping);
      setIsTyping(isTyping);
    }, 500),
    [sendTypingIndicator]
  );
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping(e.target.value.length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            className="w-full px-3 py-2 border rounded-lg resize-none"
            rows={1}
            disabled={disabled}
          />
          
          {attachments.length > 0 && (
            <AttachmentPreview 
              attachments={attachments}
              onRemove={setAttachments}
            />
          )}
        </div>
        
        <FileUploadButton onSelect={setAttachments} />
        <EmojiPicker onSelect={(emoji) => setMessage(prev => prev + emoji)} />
        
        <Button 
          type="submit" 
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          Send
        </Button>
      </div>
    </form>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 State Management

### WebSocket Integration
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Real-time chat hook
export function useWebSocket(roomId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/chat`);
    
    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'join_room', roomId }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [roomId]);
  
  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message]);
        break;
      case 'user_typing':
        // Handle typing indicators
        break;
      case 'user_joined':
        // Handle user presence
        break;
    }
  };
  
  const sendMessage = useCallback((content: string) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'send_message',
        content,
        roomId
      }));
    }
  }, [socket, isConnected, roomId]);
  
  return { isConnected, sendMessage, messages };
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Chat State Management
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Chat store (Zustand)
interface ChatStore {
  activeRoomId: string | null;
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, string[]>;
  
  setActiveRoom: (roomId: string) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  updateTypingUsers: (roomId: string, users: string[]) => void;
  markAsRead: (roomId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  activeRoomId: null,
  rooms: [],
  messages: {},
  typingUsers: {},
  
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  
  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message]
    }
  })),
  
  updateTypingUsers: (roomId, users) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [roomId]: users
    }
  })),
  
  markAsRead: (roomId) => {
    // Mark messages as read logic
  }
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Real-time Features

### Typing Indicators
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function TypingIndicator({ roomId }: { roomId: string }) {
  const typingUsers = useChatStore(state => state.typingUsers[roomId] || []);
  
  if (typingUsers.length === 0) return null;
  
  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {typingUsers.length === 1 
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers.slice(-1)} are typing...`
      }
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### User Presence
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function UserPresence({ userId }: { userId: string }) {
  const { data: presence } = useQuery({
    queryKey: ['user-presence', userId],
    queryFn: () => chatApi.getUserPresence(userId),
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        presence?.status === 'online' ? "bg-green-500" : "bg-gray-400"
      )} />
      <span className="text-sm">
        {presence?.status === 'online' ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Message Reactions
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function MessageReactions({ message }: { message: ChatMessage }) {
  const [reactions, setReactions] = useState(message.reactions || {});
  const { mutate: addReaction } = useMutation({
    mutationFn: (emoji: string) => chatApi.addReaction(message.id, emoji),
    onSuccess: (newReactions) => setReactions(newReactions)
  });
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(reactions).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => addReaction(emoji)}
          className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
        >
          <span>{emoji}</span>
          <span>{users.length}</span>
        </button>
      ))}
      
      <EmojiPicker onSelect={addReaction} />
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Getting Started

### Development Setup
1. **WebSocket Configuration**: Configure WebSocket client connection
2. **API Integration**: Set up tRPC client for chat endpoints
3. **State Management**: Initialize Zustand store for chat state
4. **Real-time Features**: Implement typing indicators and presence

### Testing
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Component testing example
describe('MessageInput', () => {
  it('sends message on enter key', async () => {
    const onSend = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello world!{enter}');
    
    expect(onSend).toHaveBeenCalledWith({
      content: 'Hello world!',
      attachments: []
    });
  });
  
  it('shows typing indicator', async () => {
    const { rerender } = render(<TypingIndicator roomId="test" />);
    
    // Simulate typing users update
    act(() => {
      useChatStore.getState().updateTypingUsers('test', ['John']);
    });
    
    rerender(<TypingIndicator roomId="test" />);
    expect(screen.getByText('John is typing...')).toBeInTheDocument();
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

**Status**: Under Development  
**Maintained By**: Chat Team  
**Last Updated**: 2025-07-12
