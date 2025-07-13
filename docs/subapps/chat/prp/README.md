<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: subapp
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Chat PRP (Prompt Engineering)

Prompt engineering and AI-powered features for the Chat SubApp, including intelligent message processing, automated responses, and conversation enhancement.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
PRP (Prompt Engineering) documentation for Chat covering AI-powered chat features, automated assistance, message analysis, and intelligent conversation tools.

### Core Components
- **Smart Replies**: AI-generated response suggestions
- **Message Analysis**: Sentiment and intent detection
- **Auto-moderation**: Content filtering and safety
- **Conversation Summaries**: AI-powered chat summaries
- **Translation Services**: Real-time message translation

## 📋 Content Plan

This section will contain:
- **Conversation AI**: Intelligent chat assistance patterns
- **Message Processing**: Content analysis and enhancement
- **Moderation Systems**: Automated content safety
- **Response Generation**: Smart reply suggestions
- **Context Understanding**: Conversation flow analysis

## 🧠 AI-Powered Chat Features

### Smart Reply Generation
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface SmartReplyEngine {
  generateReplies(context: ConversationContext): Promise<SmartReply[]>;
  analyzeMessage(message: ChatMessage): Promise<MessageAnalysis>;
  detectIntent(message: string): Promise<Intent>;
}

// Smart reply implementation
export class ChatAIService {
  async generateSmartReplies(
    conversation: ChatMessage[], 
    currentUser: User
  ): Promise<SmartReply[]> {
    const context = this.buildConversationContext(conversation);
    
    const prompt = `
      Based on this conversation context, suggest 3 appropriate replies:
      
      Conversation:
      ${context.recentMessages.map(m => `${m.user.name}: ${m.content}`).join('\n')}
      
      Current user: ${currentUser.name}
      Conversation tone: ${context.tone}
      
      Generate replies that are:
      1. Contextually appropriate
      2. Match the conversation tone
      3. Helpful and engaging
      
      Format as JSON array of reply options.
    `;
    
    const response = await this.aiProvider.complete(prompt, {
      temperature: 0.7,
      maxTokens: 200
    });
    
    return this.parseSmartReplies(response);
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Message Analysis Engine
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface MessageAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  toxicity: number; // 0-1 scale
  intent: Intent;
  entities: Entity[];
  suggestedActions: string[];
}

export class MessageAnalyzer {
  async analyzeMessage(message: ChatMessage): Promise<MessageAnalysis> {
    const analysisPrompt = `
      Analyze this chat message for:
      1. Sentiment (positive/neutral/negative)
      2. Toxicity level (0-1 scale)
      3. Intent detection
      4. Named entities
      5. Suggested moderation actions
      
      Message: "${message.content}"
      Context: ${message.context}
      
      Return analysis as JSON.
    `;
    
    const analysis = await this.aiProvider.complete(analysisPrompt, {
      temperature: 0.1,
      maxTokens: 300
    });
    
    return this.parseAnalysis(analysis);
  }
  
  async detectUnsafeContent(message: string): Promise<ModerationResult> {
    const moderationPrompt = `
      Evaluate this message for safety violations:
      - Harassment or hate speech
      - Inappropriate content
      - Spam or promotional content
      - Personal information disclosure
      
      Message: "${message}"
      
      Provide:
      1. Safety score (0-1, where 1 is completely safe)
      2. Violation categories (if any)
      3. Recommended action (allow/warn/block)
      4. Explanation
    `;
    
    const result = await this.aiProvider.complete(moderationPrompt, {
      temperature: 0.1,
      maxTokens: 200
    });
    
    return this.parseModerationResult(result);
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Implementation Patterns

### Conversation Context Building
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface ConversationContext {
  recentMessages: ChatMessage[];
  participants: User[];
  tone: 'formal' | 'casual' | 'professional';
  topic: string;
  metadata: ContextMetadata;
}

export class ContextBuilder {
  buildContext(messages: ChatMessage[], maxContext = 20): ConversationContext {
    const recentMessages = messages.slice(-maxContext);
    const participants = this.extractParticipants(recentMessages);
    const tone = this.detectTone(recentMessages);
    const topic = this.extractTopic(recentMessages);
    
    return {
      recentMessages,
      participants,
      tone,
      topic,
      metadata: {
        messageCount: messages.length,
        timespan: this.calculateTimespan(messages),
        averageResponseTime: this.calculateAvgResponseTime(messages)
      }
    };
  }
  
  private detectTone(messages: ChatMessage[]): 'formal' | 'casual' | 'professional' {
    const combinedText = messages.map(m => m.content).join(' ');
    
    // Use AI to detect tone
    const tonePrompt = `
      Analyze the tone of this conversation:
      "${combinedText}"
      
      Classify as: formal, casual, or professional
      Return only the classification.
    `;
    
    // Implementation would call AI service
    return 'casual'; // placeholder
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Automated Response Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Auto-response system for common scenarios
export class AutoResponseEngine {
  private responsePatterns: Map<string, ResponseTemplate> = new Map([
    ['greeting', {
      triggers: ['hello', 'hi', 'hey'],
      responses: [
        'Hello! How can I help you today?',
        'Hi there! What can I assist you with?',
        'Hey! Good to see you here!'
      ]
    }],
    ['goodbye', {
      triggers: ['bye', 'goodbye', 'see you'],
      responses: [
        'Goodbye! Have a great day!',
        'See you later!',
        'Take care!'
      ]
    }]
  ]);
  
  async generateAutoResponse(
    message: ChatMessage, 
    context: ConversationContext
  ): Promise<string | null> {
    // Check if auto-response is appropriate
    if (!this.shouldAutoRespond(message, context)) {
      return null;
    }
    
    // Find matching pattern
    const pattern = this.findMatchingPattern(message.content);
    if (!pattern) return null;
    
    // Generate contextual response
    const response = await this.generateContextualResponse(pattern, context);
    
    return response;
  }
  
  private shouldAutoRespond(
    message: ChatMessage, 
    context: ConversationContext
  ): boolean {
    // Don't auto-respond in active conversations
    if (context.recentMessages.length > 5) return false;
    
    // Don't auto-respond to questions
    if (message.content.includes('?')) return false;
    
    // Only respond to simple greetings/farewells
    return this.isSimpleIntent(message.content);
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Translation Integration
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Real-time message translation
export class MessageTranslator {
  async translateMessage(
    message: ChatMessage, 
    targetLanguage: string
  ): Promise<TranslatedMessage> {
    if (this.isTargetLanguage(message.content, targetLanguage)) {
      return { original: message, translated: null };
    }
    
    const translationPrompt = `
      Translate this message to ${targetLanguage}:
      "${message.content}"
      
      Preserve:
      - Tone and emotion
      - Technical terms
      - Proper names
      - Formatting
      
      Return only the translation.
    `;
    
    const translation = await this.aiProvider.complete(translationPrompt, {
      temperature: 0.3,
      maxTokens: message.content.length * 2
    });
    
    return {
      original: message,
      translated: {
        content: translation,
        language: targetLanguage,
        confidence: await this.calculateConfidence(translation)
      }
    };
  }
  
  async detectLanguage(text: string): Promise<LanguageDetection> {
    const detectionPrompt = `
      Detect the language of this text:
      "${text}"
      
      Return ISO 639-1 language code and confidence (0-1).
      Format: {"language": "en", "confidence": 0.95}
    `;
    
    const result = await this.aiProvider.complete(detectionPrompt, {
      temperature: 0.1,
      maxTokens: 50
    });
    
    return JSON.parse(result);
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🛡️ Safety & Moderation

### Content Safety Pipeline
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export class ContentSafetyPipeline {
  async processMessage(message: ChatMessage): Promise<SafetyResult> {
    const pipeline = [
      this.checkToxicity,
      this.checkSpam,
      this.checkPrivacy,
      this.checkHarassment
    ];
    
    const results = await Promise.all(
      pipeline.map(check => check(message))
    );
    
    return this.aggregateResults(results);
  }
  
  private async checkToxicity(message: ChatMessage): Promise<SafetyCheck> {
    const prompt = `
      Rate the toxicity of this message on a scale of 0-1:
      "${message.content}"
      
      Consider:
      - Offensive language
      - Personal attacks
      - Hate speech
      - Harassment
      
      Return only the numeric score.
    `;
    
    const score = await this.aiProvider.complete(prompt, {
      temperature: 0.1,
      maxTokens: 10
    });
    
    return {
      type: 'toxicity',
      score: parseFloat(score),
      threshold: 0.7,
      action: parseFloat(score) > 0.7 ? 'block' : 'allow'
    };
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Getting Started

### AI Service Integration
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Initialize chat AI services
export function setupChatAI() {
  const aiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
  
  return {
    smartReplies: new SmartReplyEngine(aiProvider),
    messageAnalyzer: new MessageAnalyzer(aiProvider),
    translator: new MessageTranslator(aiProvider),
    moderator: new ContentSafetyPipeline(aiProvider)
  };
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Usage Examples
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Smart reply suggestions
const replies = await chatAI.smartReplies.generateReplies(conversation);

// Message moderation
const safety = await chatAI.moderator.processMessage(message);
if (safety.action === 'block') {
  // Handle unsafe content
}

// Real-time translation
const translated = await chatAI.translator.translateMessage(message, 'es');
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Testing Framework
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
describe('Smart Reply Engine', () => {
  it('generates contextually appropriate replies', async () => {
    const conversation = [
      { content: 'How was your weekend?', user: { name: 'Alice' } },
      { content: 'Pretty good, went hiking. How about you?', user: { name: 'Bob' } }
    ];
    
    const replies = await smartReplyEngine.generateReplies(conversation);
    
    expect(replies).toHaveLength(3);
    expect(replies[0].content).toMatch(/weekend|hiking|good/i);
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

**Status**: Under Development  
**Maintained By**: Chat AI Team  
**Last Updated**: 2025-07-12
