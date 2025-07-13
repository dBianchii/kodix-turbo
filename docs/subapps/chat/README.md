<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: subapp
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Chat SubApp Documentation

Chat is a modular feature within the main Kodix platform that provides real-time communication capabilities, messaging, and collaborative features.

## 📁 Structure

### [Backend](./backend/)
Server-side implementation, real-time messaging APIs, and communication services.

### [Frontend](./frontend/)
Chat interface components, real-time updates, and user interaction design.

### [PRP](./prp/)
Product Requirements Prompts and feature specifications for Chat development.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Chat SubApp enables users to:
- Send and receive real-time messages
- Participate in group conversations
- Share files and media
- Integrate with other platform features
- Maintain communication history

## 🏗️ 🏗️ Architecture

As a SubApp, Chat:
- Shares runtime with the main Kodix web application
- Integrates with core platform services
- Follows modular architecture patterns
- Implements real-time communication protocols

## 📋 Development Guidelines

### Backend Development
- Follow tRPC patterns for API endpoints
- Implement WebSocket connections for real-time features
- Use TypeScript for type safety
- Integrate with core platform authentication

### Frontend Development
- Use established component patterns
- Implement real-time UI updates
- Follow UI design system guidelines
- Ensure responsive design for mobile and desktop

### Real-time Features
- WebSocket connection management
- Message synchronization
- Presence indicators
- Typing indicators and read receipts

## 🚀 Getting Started

1. Review <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
<!-- AI-CONTEXT-REF: importance="high" type="standards" -->
[Architecture Standards](../../architecture/standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
<!-- /AI-LINK -->
2. Follow <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[SubApp Development Guide](../../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
3. Check [Development Setup](../../development/setup/)
4. Understand <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Testing Guidelines](../../development/testing/)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> for real-time features

---

**Maintained By**: Chat Feature Team  
**Last Updated**: 2025-07-12  
**Status**: Active Development
