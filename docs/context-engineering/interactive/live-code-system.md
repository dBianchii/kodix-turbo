# Live Code Example System

<!-- AI-METADATA:
category: automation
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: fullstack
ai-context-weight: essential
last-ai-review: 2025-01-12
dependencies: ["metadata-schema-v2.md", "ai-first-markup.md"]
related-concepts: ["interactive-documentation", "live-validation", "api-testing"]
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Live code example system that executes documentation code against real APIs in real-time.
<!-- /AI-COMPRESS -->

Interactive code execution system that transforms static documentation examples into live, executable code connected to actual development APIs. Enables developers to test and modify examples directly within the documentation.

## 🏗️ 🏗️ Architecture

### System Components

```typescript
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
// AI-CONTEXT: Live code example system architecture
interface LiveCodeSystem {
  executor: CodeExecutor;
  validator: RealTimeValidator;
  playground: InteractivePlayground;
  apiProxy: DevelopmentApiProxy;
}

interface CodeExecutor {
  execute(code: string, context: ExecutionContext): Promise<ExecutionResult>;
  validate(code: string): ValidationResult;
  transform(code: string): TransformedCode;
}

interface ExecutionContext {
  environment: 'development' | 'staging' | 'sandbox';
  userId?: string;
  teamId?: string;
  permissions: string[];
  timeLimit: number;
}

interface ExecutionResult {
  success: boolean;
  output: any;
  logs: LogEntry[];
  metrics: ExecutionMetrics;
  errors?: ErrorDetail[];
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Live Example Framework

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: Framework for embedding live examples in documentation
class LiveExampleFramework {
  private apiProxy: DevelopmentApiProxy;
  private validator: CodeValidator;
  
  constructor(config: LiveExampleConfig) {
    this.apiProxy = new DevelopmentApiProxy(config.apiEndpoint);
    this.validator = new CodeValidator(config.validationRules);
  }
  
  // Transform static code blocks into interactive examples
  async transformCodeBlock(
    element: HTMLElement,
    metadata: LiveExampleMetadata
  ): Promise<InteractiveCodeBlock> {
    const code = this.extractCode(element);
    const context = this.buildExecutionContext(metadata);
    
    return new InteractiveCodeBlock({
      code,
      context,
      onExecute: this.handleExecution.bind(this),
      onValidate: this.handleValidation.bind(this),
      realTimeUpdates: metadata.realTimeUpdates
    });
  }
  
  private async handleExecution(code: string, context: ExecutionContext) {
    // Validate code safety
    const validation = await this.validator.validate(code);
    if (!validation.safe) {
      throw new Error(`Unsafe code detected: ${validation.issues.join(', ')}`);
    }
    
    // Execute against development API
    return this.apiProxy.execute(code, context);
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Implementation Components

### 1. Live tRPC Examples

<!-- AI-INTERACTIVE: type="code-playground" -->
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-live
// AI-CONTEXT: Live tRPC example with real API connection
// AI-ENVIRONMENT: development
// AI-VALIDATION: real-time
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";

function LiveUserQuery() {
  const trpc = useTRPC();
  
  // This connects to the actual development API
  const { data, isLoading, error } = useQuery(
    trpc.user.getAll.queryOptions({
      limit: 5,
      orderBy: 'createdAt'
    })
  );
  
  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>Live User Data</h3>
      <ul>
        {data?.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Live execution result displays here
export default LiveUserQuery;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Live Result**: 
- **Status**: ✅ Connected to development API
- **Response Time**: ~150ms
- **Users Loaded**: 5
- **Last Updated**: Real-time

**Try Modifications**:
- Change `limit` to see different numbers of users
- Modify `orderBy` to sort differently
- Add filters to the query

<!-- /AI-INTERACTIVE -->

### 2. Interactive SubApp Creation

<!-- AI-INTERACTIVE: type="workflow-playground" -->
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-live
// AI-CONTEXT: Interactive SubApp creation workflow
// AI-WORKFLOW: step="1" total="3"
import { createSubApp } from "~/core/subapp-factory";

// Step 1: Define SubApp configuration
const subAppConfig = {
  name: "example-feature",
  displayName: "Example Feature",
  description: "A demo SubApp for interactive documentation",
  permissions: ["read", "write"],
  routes: [
    { path: "/example", component: "ExamplePage" },
    { path: "/example/settings", component: "SettingsPage" }
  ],
  apis: [
    { name: "getExampleData", type: "query" },
    { name: "updateExample", type: "mutation" }
  ]
};

// Step 2: Create the SubApp (connects to real system)
async function createExampleSubApp() {
  try {
    const result = await createSubApp(subAppConfig);
    
    return {
      success: true,
      subAppId: result.id,
      routes: result.routes,
      message: `SubApp '${subAppConfig.name}' created successfully!`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 3: Execute creation
export default createExampleSubApp;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Interactive Controls**:
- **SubApp Name**: [Editable field]
- **Permissions**: [Checkbox selection]
- **Routes**: [Dynamic list editor]
- **Execute Creation**: [Button]

**Live Output**:
```json
{
  "success": true,
  "subAppId": "subapp_example_20250112",
  "message": "SubApp 'example-feature' created in development environment",
  "previewUrl": "http://localhost:3000/subapps/example-feature"
}
```

<!-- /AI-INTERACTIVE -->

### 3. Real-time API Testing

<!-- AI-INTERACTIVE: type="api-tester" -->
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-live
// AI-CONTEXT: Real-time API testing interface
import { useTRPC } from "~/trpc/react";

function ApiTester() {
  const trpc = useTRPC();
  
  // Test different API endpoints interactively
  const testEndpoints = {
    'user.getById': async (id: string) => {
      return trpc.user.getById.query({ id });
    },
    
    'team.create': async (data: CreateTeamInput) => {
      return trpc.team.create.mutate(data);
    },
    
    'subapp.list': async (filters?: SubAppFilters) => {
      return trpc.subapp.list.query(filters);
    }
  };
  
  return (
    <div className="api-tester">
      <h3>Interactive API Tester</h3>
      
      {Object.entries(testEndpoints).map(([name, handler]) => (
        <div key={name} className="endpoint-test">
          <h4>{name}</h4>
          <button onClick={() => executeTest(name, handler)}>
            Test Endpoint
          </button>
          <div className="result" id={`result-${name}`}>
            {/* Results appear here */}
          </div>
        </div>
      ))}
    </div>
  );
}

async function executeTest(name: string, handler: Function) {
  const resultDiv = document.getElementById(`result-${name}`);
  
  try {
    resultDiv.innerHTML = 'Executing...';
    const result = await handler();
    
    resultDiv.innerHTML = `
      <pre>${JSON.stringify(result, null, 2)}</pre>
      <small>Executed at: ${new Date().toISOString()}</small>
    `;
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="error">Error: ${error.message}</div>
    `;
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

<!-- /AI-INTERACTIVE -->

## 🏗️ 🔄 Integration Architecture

### Development API Proxy

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: Secure proxy for connecting documentation to development APIs
class DevelopmentApiProxy {
  private baseUrl: string;
  private validator: RequestValidator;
  private rateLimiter: RateLimiter;
  
  constructor(config: ProxyConfig) {
    this.baseUrl = config.developmentApiUrl;
    this.validator = new RequestValidator(config.allowedOperations);
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    });
  }
  
  async execute(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    // Rate limiting
    if (!this.rateLimiter.isAllowed(context.userId)) {
      throw new Error('Rate limit exceeded');
    }
    
    // Code validation
    const validation = await this.validator.validateCode(code);
    if (!validation.safe) {
      throw new Error(`Unsafe operation: ${validation.reason}`);
    }
    
    // Transform code for safe execution
    const safeCode = this.transformCode(code, context);
    
    // Execute in sandboxed environment
    return this.executeInSandbox(safeCode, context);
  }
  
  private transformCode(code: string, context: ExecutionContext): string {
    // Add safety wrappers
    // Inject context variables
    // Limit execution scope
    return `
      (async function() {
        const trpc = createRestrictedTrpcClient(${JSON.stringify(context)});
        
        ${code}
      })();
    `;
  }
  
  private async executeInSandbox(
    code: string, 
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Execute with timeout and resource limits
      const result = await this.sandbox.execute(code, {
        timeout: context.timeLimit,
        memoryLimit: '50MB',
        networkAccess: 'restricted'
      });
      
      return {
        success: true,
        output: result.output,
        logs: result.logs,
        metrics: {
          executionTime: Date.now() - startTime,
          memoryUsed: result.memoryUsed
        }
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        logs: [],
        errors: [{ 
          message: error.message, 
          stack: error.stack 
        }],
        metrics: {
          executionTime: Date.now() - startTime,
          memoryUsed: 0
        }
      };
    }
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Safety and Security

<!-- AI-CONTEXT-LAYER: level="1" importance="critical" -->

#### Code Validation Rules
```typescript
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
const VALIDATION_RULES = {
  // Allowed imports only
  allowedImports: [
    '~/trpc/react',
    '@tanstack/react-query',
    'react',
    'react-dom'
  ],
  
  // Forbidden operations
  forbiddenPatterns: [
    /eval\s*\(/,
    /Function\s*\(/,
    /document\.write/,
    /window\.location/,
    /localStorage\./,
    /sessionStorage\./,
    /process\.env/,
    /require\s*\(/,
    /import\s*\(/
  ],
  
  // Rate limiting
  maxExecutionsPerMinute: 10,
  maxExecutionTime: 5000, // 5 seconds
  
  // API restrictions
  allowedEndpoints: [
    'user.getById',
    'user.getAll',
    'team.list',
    'subapp.list',
    'subapp.create' // Only in development mode
  ]
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### Sandbox Environment
- **Isolated execution**: No access to parent context
- **Resource limits**: Memory and CPU restrictions
- **Network restrictions**: Only allowed API endpoints
- **Time limits**: Maximum execution time
- **Audit logging**: All executions logged for security

## 📱 User Interface Components

### Interactive Code Block Component

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: React component for interactive code blocks
interface InteractiveCodeBlockProps {
  code: string;
  language: 'typescript' | 'javascript';
  executionContext: ExecutionContext;
  showOutput?: boolean;
  allowEditing?: boolean;
  realTimeValidation?: boolean;
}

function InteractiveCodeBlock({
  code: initialCode,
  language,
  executionContext,
  showOutput = true,
  allowEditing = true,
  realTimeValidation = true
}: InteractiveCodeBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const liveCodeSystem = useLiveCodeSystem();
  
  // Real-time validation
  useEffect(() => {
    if (realTimeValidation) {
      const validate = async () => {
        const result = await liveCodeSystem.validate(code);
        setValidationErrors(result.errors);
      };
      
      const debounced = debounce(validate, 500);
      debounced();
    }
  }, [code, realTimeValidation]);
  
  const handleExecute = async () => {
    setIsExecuting(true);
    
    try {
      const result = await liveCodeSystem.execute(code, executionContext);
      setOutput(result);
    } catch (error) {
      setOutput({
        success: false,
        output: null,
        logs: [],
        errors: [{ message: error.message, stack: error.stack }],
        metrics: { executionTime: 0, memoryUsed: 0 }
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="interactive-code-block">
      <div className="code-editor">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          readOnly={!allowEditing}
          errors={validationErrors}
        />
        
        <div className="controls">
          <button 
            onClick={handleExecute}
            disabled={isExecuting || validationErrors.length > 0}
            className="execute-button"
          >
            {isExecuting ? 'Executing...' : 'Run Code'}
          </button>
          
          <button onClick={() => setCode(initialCode)}>
            Reset
          </button>
        </div>
      </div>
      
      {showOutput && output && (
        <div className="output-panel">
          <h4>Output</h4>
          
          {output.success ? (
            <div className="success-output">
              <pre>{JSON.stringify(output.output, null, 2)}</pre>
              
              {output.logs.length > 0 && (
                <div className="logs">
                  <h5>Logs</h5>
                  {output.logs.map((log, index) => (
                    <div key={index} className={`log-${log.level}`}>
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="metrics">
                <small>
                  Executed in {output.metrics.executionTime}ms
                </small>
              </div>
            </div>
          ) : (
            <div className="error-output">
              {output.errors?.map((error, index) => (
                <div key={index} className="error">
                  {error.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 🔧 Setup and Configuration

### Installation Script

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
#!/bin/bash
# AI-CONTEXT: Setup script for live code example system

echo "🚀 Setting up Live Code Example System..."

# Install dependencies
pnpm add @monaco-editor/react codemirror @uiw/react-codemirror
pnpm add @tanstack/react-query @trpc/client @trpc/server

# Create directory structure
mkdir -p src/components/interactive
mkdir -p src/lib/live-code
mkdir -p config/live-examples

# Copy configuration files
cp templates/live-code-config.ts config/
cp templates/sandbox-worker.js public/

# Set up development API proxy
echo "Setting up development API proxy..."
cat > config/live-examples/proxy.config.ts << EOF
export const LIVE_CODE_CONFIG = {
  developmentApiUrl: process.env.DEV_API_URL || 'http://localhost:3001',
  sandboxUrl: '/sandbox-worker.js',
  maxExecutionsPerMinute: 10,
  executionTimeout: 5000,
  allowedEndpoints: [
    'user.getById',
    'user.getAll',
    'team.list',
    'subapp.list'
  ]
};
EOF

echo "✅ Live code system setup complete!"
echo "Next steps:"
echo "1. Configure your development API endpoint"
echo "2. Test with a simple example"
echo "3. Add live examples to your documentation"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Development Environment Integration

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: Integration with Kodix development environment
// next.config.js additions for live code system

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['vm2']
  },
  
  async rewrites() {
    return [
      // Proxy live code execution requests to development API
      {
        source: '/api/live-code/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  },
  
  webpack: (config) => {
    // Add worker support for sandbox execution
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' }
    });
    
    return config;
  }
};

module.exports = nextConfig;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 💡 📊 Usage Analytics

### Tracking Interactive Features

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: Analytics for interactive documentation usage
interface InteractiveAnalytics {
  trackCodeExecution(metadata: {
    documentPath: string;
    codeBlockId: string;
    executionTime: number;
    success: boolean;
    userId?: string;
  }): void;
  
  trackUserEngagement(metadata: {
    documentPath: string;
    interactionType: 'code_edit' | 'code_execute' | 'playground_use';
    duration: number;
    userId?: string;
  }): void;
  
  trackApiUsage(metadata: {
    endpoint: string;
    responseTime: number;
    success: boolean;
    documentContext: string;
  }): void;
}

class LiveCodeAnalytics implements InteractiveAnalytics {
  private analytics: AnalyticsProvider;
  
  trackCodeExecution(metadata: any) {
    this.analytics.track('live_code_execution', {
      ...metadata,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    });
  }
  
  trackUserEngagement(metadata: any) {
    this.analytics.track('documentation_interaction', {
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }
  
  trackApiUsage(metadata: any) {
    this.analytics.track('api_usage_from_docs', {
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }
  
  generateUsageReport(): InteractiveUsageReport {
    return {
      totalExecutions: this.getTotalExecutions(),
      popularEndpoints: this.getPopularEndpoints(),
      avgExecutionTime: this.getAverageExecutionTime(),
      errorRate: this.getErrorRate(),
      userEngagement: this.getUserEngagementMetrics()
    };
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**📝 Status**: Live Code Example System v1.0  
**🎯 Phase 4**: Week 3 Interactive Features  
**🚀 Implementation**: Framework and components ready  
**📊 Next**: Interactive playgrounds for key workflows