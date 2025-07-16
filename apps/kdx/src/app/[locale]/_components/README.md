# 🛡️ Error Handling System

A comprehensive error handling system for the Kodix application that provides friendly user experiences when things go wrong.

## 🎯 Overview

This system replaces technical error messages with user-friendly interfaces that:

- **Detect error types** automatically (server crashes, database issues, network problems)
- **Show appropriate messages** in the user's language
- **Provide recovery options** like retry buttons and navigation
- **Monitor server health** and attempt automatic recovery
- **Log errors properly** for debugging and monitoring

## 📦 Components

### 1. Global Error Handler (`global-error.tsx`)

The main error boundary that catches unhandled errors at the application level.

**Features:**

- ✅ Automatic error type detection
- ✅ Server health monitoring
- ✅ Automatic retry with exponential backoff
- ✅ Multi-language support
- ✅ Development mode debugging info
- ✅ Graceful fallback UI

**Usage:**

```tsx
// Automatically used by Next.js for unhandled errors
// No manual implementation needed - works out of the box
```

### 2. Error Boundary (`error-boundary.tsx`)

A React Error Boundary component for catching errors in component trees.

**Features:**

- ✅ Configurable error levels (page, feature, component)
- ✅ Automatic retry mechanism (up to 3 attempts)
- ✅ Error logging and reporting
- ✅ Customizable fallback UI
- ✅ HOC pattern support

**Usage:**

```tsx
import { ErrorBoundary } from "~/app/[locale]/_components/error-boundary";

// Basic usage
<ErrorBoundary level="component">
  <MyComponent />
</ErrorBoundary>

// With custom error handler
<ErrorBoundary
  level="page"
  showDetails={true}
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error("Page error:", error);
  }}
>
  <MyPageContent />
</ErrorBoundary>

// Using HOC pattern
const SafeComponent = withErrorBoundary(MyComponent, {
  level: "feature",
  showDetails: false
});
```

### 3. Error Fallback UI (`error-fallback.tsx`)

Reusable error UI components for different scenarios.

**Features:**

- ✅ Multiple error types (server, network, database, client)
- ✅ Configurable sizes (sm, md, lg)
- ✅ Customizable actions (retry, navigation)
- ✅ Specialized components for common scenarios

**Usage:**

```tsx
import {
  ErrorFallback,
  DatabaseErrorFallback,
  NetworkErrorFallback,
  ServerErrorFallback,
  MinimalErrorFallback
} from "~/app/[locale]/_components/error-fallback";

// Generic error fallback
<ErrorFallback
  type="server"
  showRetry={true}
  showNavigation={true}
  onRetry={() => window.location.reload()}
/>

// Database specific error
<DatabaseErrorFallback
  onRetry={() => refetchData()}
/>

// Network error with custom message
<NetworkErrorFallback
  title="Connection Lost"
  message="Please check your internet connection"
  onRetry={() => retryConnection()}
/>

// Minimal error for small components
<MinimalErrorFallback
  error={error}
  onRetry={() => retry()}
/>
```

### 4. Server Health Check (`/api/health`)

API endpoint for monitoring server and database health.

**Features:**

- ✅ Database connectivity check
- ✅ Server status monitoring
- ✅ Response time measurement
- ✅ Memory usage reporting

**Usage:**

```typescript
// Automatic usage by global error handler
// Manual usage:
const healthCheck = async () => {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    console.log("Server health:", data);
  } catch (error) {
    console.error("Health check failed:", error);
  }
};
```

## 🔧 Error Types

The system automatically detects and handles different error types:

### Server Errors

- **Database Connection**: MySQL/Drizzle connection failures
- **Server Crash**: React Server Components render errors
- **Timeout**: Request timeout errors
- **Maintenance**: 503 service unavailable

### Client Errors

- **Network**: Connection refused, fetch failures
- **Chunk Loading**: JavaScript bundle loading errors
- **Hydration**: React hydration mismatches
- **Component**: General React component errors

## 🌍 Internationalization

All error messages support multiple languages through the `api.errors` translation namespace:

```json
{
  "api": {
    "errors": {
      "server": {
        "title": "Server Error",
        "message": "We're experiencing technical difficulties...",
        "database": {
          "title": "Database Connection Error",
          "message": "We're having trouble connecting to our database..."
        }
      }
    }
  }
}
```

## 📊 Error Logging

The system logs errors with structured data for debugging and monitoring:

```typescript
{
  "errorId": "err_1642684800000_abc123",
  "level": "page",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "message": "Database connection failed",
  "stack": "Error: ECONNREFUSED...",
  "componentStack": "at MyComponent...",
  "url": "https://app.kodix.com/dashboard",
  "userAgent": "Mozilla/5.0..."
}
```

## 🔄 Recovery Mechanisms

### Automatic Recovery

- **Server Health Monitoring**: Periodically checks server status
- **Auto-retry**: Attempts recovery up to 3 times
- **Exponential Backoff**: Delays between retry attempts
- **Health-based Recovery**: Only retries when server is healthy

### Manual Recovery

- **Retry Button**: User-initiated recovery
- **Page Refresh**: Full page reload option
- **Navigation**: Go back or go home options

## 🚀 Usage Examples

### Chat Application Error Handling

```tsx
// Chat component with error boundary
<ErrorBoundary level="feature" onError={logChatError}>
  <ChatWindow sessionId={sessionId} />
</ErrorBoundary>;

// Message loading error
{
  messageError && (
    <NetworkErrorFallback size="sm" onRetry={() => retryMessages()} />
  );
}
```

### Database Query Error Handling

```tsx
// Query component with database error handling
const MyDataComponent = () => {
  const { data, error, retry } = useQuery(fetchData);

  if (error) {
    return <DatabaseErrorFallback onRetry={retry} />;
  }

  return <div>{data}</div>;
};
```

### Page Level Error Handling

```tsx
// Page component with comprehensive error handling
<ErrorBoundary level="page" showDetails={true}>
  <PageContent />
</ErrorBoundary>
```

## 🛠️ Development Mode

In development mode, the system provides additional debugging information:

- **Technical Details**: Full error messages and stack traces
- **Error IDs**: Unique identifiers for tracking
- **Retry Counters**: Number of recovery attempts
- **Server Health Status**: Real-time server monitoring

## 📈 Production Considerations

### Performance

- **Lazy Loading**: Components are loaded only when needed
- **Minimal Bundle Size**: Core error handling is lightweight
- **Efficient Health Checks**: HEAD requests for quick health checks

### Monitoring

- **Error Reporting**: Ready for integration with services like Sentry
- **Health Metrics**: Server response times and status
- **User Impact**: Friendly messages reduce user frustration

### Security

- **Error Sanitization**: Sensitive information is hidden from users
- **Development Info**: Debug details only shown in development
- **Rate Limiting**: Health checks are throttled appropriately

## 🔧 Configuration

### Environment Variables

```bash
# Health check configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=10000

# Error reporting (optional)
SENTRY_DSN=https://your-sentry-dsn
```

### Customization

```tsx
// Custom error boundary with specific behavior
<ErrorBoundary
  level="component"
  showDetails={process.env.NODE_ENV === "development"}
  onError={(error, errorInfo) => {
    // Custom error handling
    if (process.env.NODE_ENV === "production") {
      sendToSentry(error, errorInfo);
    }
  }}
  fallback={<MyCustomErrorUI />}
>
  <MyComponent />
</ErrorBoundary>
```

## 🎨 Styling

The error components use Tailwind CSS classes and support dark mode:

```tsx
// Custom styling
<ErrorFallback type="server" className="my-custom-error-styles" size="lg" />
```

## 📝 Best Practices

1. **Use appropriate error levels**: `page` for critical errors, `component` for minor issues
2. **Provide meaningful recovery actions**: Don't just show "try again"
3. **Log errors appropriately**: Include context and user actions
4. **Test error scenarios**: Simulate different error conditions
5. **Monitor error rates**: Track error frequency and types
6. **Update error messages**: Keep them helpful and current

## 🔍 Troubleshooting

### Common Issues

**Error boundaries not catching errors:**

- Ensure you're using class components or the provided ErrorBoundary
- Check that errors are thrown during rendering, not in event handlers

**Health checks failing:**

- Verify database connection configuration
- Check if `/api/health` endpoint is accessible
- Ensure proper error handling in the health check route

**Translations not working:**

- Confirm `api.errors` namespace exists in translation files
- Check that `useTranslations` is properly configured
- Verify the locale is being passed correctly

## 🚀 Future Enhancements

- **Error Analytics**: Detailed error metrics and trends
- **Smart Recovery**: AI-powered error resolution suggestions
- **User Feedback**: Allow users to report error details
- **Performance Monitoring**: Error impact on user experience
- **A/B Testing**: Different error message strategies

---

This error handling system provides a robust foundation for managing errors in the Kodix application while maintaining an excellent user experience.
