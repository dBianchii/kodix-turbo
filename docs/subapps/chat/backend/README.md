<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: subapp
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: backend
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Chat Backend

Backend implementation documentation for the Chat SubApp, including real-time messaging, WebSocket handling, and chat room management.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Chat backend provides server-side functionality for real-time messaging, chat room management, user presence tracking, and message persistence within the Kodix platform.

### Core Functionality
- **Real-time Messaging**: WebSocket-based chat communication
- **Chat Room Management**: Channel creation and moderation
- **Message Persistence**: Chat history and search capabilities
- **User Presence**: Online status and typing indicators

## 🏗️ 🏗️ Architecture

### Service Layer
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Chat service interface
export interface ChatService {
  // Room management
  createRoom(teamId: string, roomConfig: RoomConfig): Promise<ChatRoom>;
  getRooms(teamId: string, userId: string): Promise<ChatRoom[]>;
  joinRoom(roomId: string, userId: string): Promise<void>;
  leaveRoom(roomId: string, userId: string): Promise<void>;
  
  // Messaging
  sendMessage(roomId: string, message: MessageInput): Promise<Message>;
  getMessages(roomId: string, pagination: Pagination): Promise<Message[]>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
  
  // Presence
  updateUserPresence(userId: string, status: PresenceStatus): Promise<void>;
  getRoomPresence(roomId: string): Promise<UserPresence[]>;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### WebSocket Handler
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Real-time WebSocket implementation
export class ChatWebSocketHandler {
  private rooms: Map<string, Set<WebSocket>> = new Map();
  
  async handleConnection(ws: WebSocket, userId: string) {
    ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      await this.handleMessage(ws, userId, message);
    });
    
    ws.on('close', () => {
      this.handleDisconnection(userId);
    });
  }
  
  private async handleMessage(ws: WebSocket, userId: string, message: ChatMessage) {
    switch (message.type) {
      case 'join_room':
        await this.joinRoom(ws, userId, message.roomId);
        break;
      case 'send_message':
        await this.broadcastMessage(message.roomId, message.content, userId);
        break;
      case 'typing':
        await this.broadcastTyping(message.roomId, userId, message.isTyping);
        break;
    }
  }
  
  private async broadcastMessage(roomId: string, content: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const message = await this.chatService.sendMessage(roomId, {
      content,
      userId,
      type: 'text'
    });
    
    room.forEach(ws => {
      ws.send(JSON.stringify({
        type: 'new_message',
        message
      }));
    });
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### tRPC Router
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Chat tRPC router
export const chatRouter = router({
  // Room endpoints
  rooms: router({
    create: protectedProcedure
      .input(createRoomSchema)
      .mutation(async ({ ctx, input }) => {
        return await ctx.services.chat.createRoom(
          ctx.user.teamId,
          input
        );
      }),
    
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await ctx.services.chat.getRooms(
          ctx.user.teamId,
          ctx.user.id
        );
      }),
    
    join: protectedProcedure
      .input(z.object({ roomId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.services.chat.joinRoom(
          input.roomId,
          ctx.user.id
        );
      })
  }),
  
  // Message endpoints
  messages: router({
    list: protectedProcedure
      .input(getMessagesSchema)
      .query(async ({ ctx, input }) => {
        return await ctx.services.chat.getMessages(
          input.roomId,
          input.pagination
        );
      }),
    
    send: protectedProcedure
      .input(sendMessageSchema)
      .mutation(async ({ ctx, input }) => {
        return await ctx.services.chat.sendMessage(
          input.roomId,
          {
            ...input,
            userId: ctx.user.id
          }
        );
      })
  })
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Implementation Guidelines

### Database Schema
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Chat database tables
export const chatRoomTable = mysqlTable('chat_rooms', {
  id: varchar('id', { length: 191 }).primaryKey(),
  teamId: varchar('team_id', { length: 191 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'public', 'private', 'direct'
  createdBy: varchar('created_by', { length: 191 }).notNull(),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

export const chatMessageTable = mysqlTable('chat_messages', {
  id: varchar('id', { length: 191 }).primaryKey(),
  roomId: varchar('room_id', { length: 191 }).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'text', 'image', 'file'
  metadata: json('metadata'), // attachments, mentions, etc.
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const chatRoomMemberTable = mysqlTable('chat_room_members', {
  roomId: varchar('room_id', { length: 191 }).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  role: varchar('role', { length: 50 }).default('member'), // 'admin', 'moderator', 'member'
  joinedAt: timestamp('joined_at').defaultNow(),
  lastSeenAt: timestamp('last_seen_at')
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Message Processing
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Message validation and processing
export class MessageProcessor {
  async processMessage(input: MessageInput): Promise<ProcessedMessage> {
    // Validate content
    const validation = this.validateContent(input.content, input.type);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // Process mentions
    const mentions = this.extractMentions(input.content);
    
    // Process attachments
    const attachments = await this.processAttachments(input.attachments);
    
    // Sanitize content
    const sanitizedContent = this.sanitizeContent(input.content);
    
    return {
      content: sanitizedContent,
      type: input.type,
      mentions,
      attachments,
      metadata: {
        processed: true,
        timestamp: new Date()
      }
    };
  }
  
  private extractMentions(content: string): Mention[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: Mention[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push({
        username: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
    
    return mentions;
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Data Models

### Room Configuration
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['public', 'private', 'direct']),
  members: z.array(z.string()).optional()
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Message Schema
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export const sendMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(10000),
  type: z.enum(['text', 'image', 'file']).default('text'),
  attachments: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    size: z.number(),
    mimeType: z.string()
  })).optional(),
  replyTo: z.string().optional()
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Getting Started

### Development Setup
1. **WebSocket Configuration**: Set up Socket.IO or native WebSocket server
2. **Database Migration**: Run chat schema migrations
3. **Service Integration**: Initialize chat service with message queue
4. **Testing**: Set up test environments with mock WebSocket connections

### API Testing
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Test room creation
curl -X POST /api/trpc/chat.rooms.create \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "General", "type": "public"}'

# Test message sending
curl -X POST /api/trpc/chat.messages.send \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"roomId": "room_id", "content": "Hello world!", "type": "text"}'
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### WebSocket Testing
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// WebSocket client test
const ws = new WebSocket('ws://localhost:3000/chat');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'join_room',
    roomId: 'test-room'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

**Status**: Under Development  
**Maintained By**: Chat Team  
**Last Updated**: 2025-07-12
