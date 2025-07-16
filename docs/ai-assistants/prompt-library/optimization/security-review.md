<!-- AI-METADATA:
category: prompt-library
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Security Review Prompts

> Comprehensive prompts for AI-assisted security analysis and vulnerability assessment in the Kodix platform

## 🎯 Purpose

Provide systematic prompts for conducting thorough security reviews across the Kodix stack, ensuring robust protection against common vulnerabilities and maintaining team-based data isolation.

## 🔒 Comprehensive Security Audit

### Full-Stack Security Review

```markdown
**Task**: Conduct comprehensive security review for Kodix platform code

**Code to Review**: [CODE_OR_FEATURE_TO_ANALYZE]

**Security Review Framework**:

**1. Authentication & Authorization**
- [ ] Session management security
- [ ] Password handling best practices
- [ ] Multi-factor authentication implementation
- [ ] Role-based access control (RBAC)
- [ ] JWT token security

**2. Team-Based Data Isolation**
- [ ] Mandatory teamId filtering in all queries
- [ ] Cross-team data access prevention
- [ ] Admin privilege scope limitation
- [ ] Data leakage prevention

**3. Input Validation & Sanitization**
- [ ] Server-side validation implementation
- [ ] SQL injection prevention
- [ ] XSS protection mechanisms
- [ ] CSRF token implementation
- [ ] File upload security

**4. API Security**
- [ ] Rate limiting implementation
- [ ] API endpoint protection
- [ ] Error message sanitization
- [ ] Request/response validation
- [ ] CORS configuration

**5. Database Security**
- [ ] Parameterized queries usage
- [ ] Database connection security
- [ ] Sensitive data encryption
- [ ] Audit logging implementation
- [ ] Backup security

**Security Assessment Template**:
```typescript
// Security checklist for typical Kodix component

// 🔍 AUTHENTICATION CHECK
async function authenticateUser(credentials: LoginCredentials) {
  // ✅ Good: Proper validation
  const validated = LoginSchema.parse(credentials);
  
  // ✅ Good: Rate limiting check
  await rateLimiter.check(credentials.email);
  
  // ✅ Good: Secure password comparison
  const user = await db.query.users.findFirst({
    where: eq(users.email, validated.email),
  });
  
  if (!user || !await bcrypt.compare(validated.password, user.passwordHash)) {
    // ✅ Good: Generic error message
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });
  }
  
  // ✅ Good: Secure session creation
  const session = await createSecureSession(user.id, user.teamId);
  return { user: sanitizeUser(user), session };
}

// 🔍 AUTHORIZATION CHECK
async function getUserData(userId: string, requestingUser: AuthUser) {
  // ✅ Good: Team isolation check
  if (requestingUser.teamId !== await getUserTeamId(userId)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied',
    });
  }
  
  // ✅ Good: Data filtering
  return await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.teamId, requestingUser.teamId) // Mandatory team filter
    ),
    columns: {
      // ✅ Good: Exclude sensitive fields
      passwordHash: false,
      sessionToken: false,
    },
  });
}

// 🔍 INPUT VALIDATION CHECK
const CreateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name required')
    .max(255, 'Name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters'), // ✅ Good: Input sanitization
  email: z.string()
    .email('Invalid email')
    .transform(email => email.toLowerCase().trim()), // ✅ Good: Normalization
  teamId: z.string().uuid('Invalid team ID'), // ✅ Good: Format validation
});
```

**Security Scoring**:
- 🚨 **Critical** (9-10): Immediate security vulnerabilities
- 🔴 **High** (7-8): Significant security risks
- 🟡 **Medium** (5-6): Moderate security concerns
- 🟢 **Low** (1-4): Minor security improvements
- ✅ **Secure** (0): No security issues detected
```

## 🛡️ Authentication Security Review

### Authentication System Analysis

```markdown
**Task**: Review authentication implementation for security vulnerabilities

**Authentication Code**: [AUTH_CODE_TO_REVIEW]

**Authentication Security Checklist**:

**1. Password Security**
- [ ] Strong password policy enforcement
- [ ] Secure password hashing (bcrypt, Argon2)
- [ ] Password history prevention
- [ ] Account lockout mechanisms

**2. Session Management**
- [ ] Secure session token generation
- [ ] Proper session invalidation
- [ ] Session timeout implementation
- [ ] Concurrent session management

**3. Multi-Factor Authentication**
- [ ] TOTP implementation security
- [ ] Backup codes security
- [ ] SMS fallback security
- [ ] Recovery process security

**Example Security Analysis**:
```typescript
// ❌ Security Issues in Authentication
class AuthService {
  async login(email: string, password: string) {
    // Issue: No rate limiting
    // Issue: No input validation
    const user = await db.users.findFirst({
      where: { email: email } // Issue: Case sensitive email
    });
    
    // Issue: Timing attack vulnerability
    if (!user) {
      throw new Error('User not found'); // Issue: Information disclosure
    }
    
    // Issue: Weak password comparison
    if (user.password === password) { // Issue: Plain text comparison!
      // Issue: Weak session token
      const token = user.id + Date.now(); // Issue: Predictable token
      return { token, user };
    }
    
    throw new Error('Invalid password'); // Issue: Different error messages
  }
}

// ✅ Secure Authentication Implementation
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

class SecureAuthService {
  private loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  async login(credentials: LoginRequest): Promise<AuthResult> {
    // Validate input
    const { email, password } = LoginSchema.parse(credentials);
    
    // Rate limiting check
    await this.checkRateLimit(email);
    
    // Normalize email for lookup
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      // Get user with consistent timing
      const user = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
        columns: {
          id: true,
          email: true,
          passwordHash: true,
          teamId: true,
          role: true,
          emailVerified: true,
          lockedUntil: true,
          failedLoginAttempts: true,
        },
      });
      
      // Check account lockout
      if (user?.lockedUntil && user.lockedUntil > new Date()) {
        await this.logSecurityEvent('login_attempt_locked', { email });
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Account temporarily locked',
        });
      }
      
      // Verify password (constant time comparison)
      const isValidPassword = user ? 
        await bcrypt.compare(password, user.passwordHash) : 
        await bcrypt.compare(password, '$2b$12$dummy.hash.to.prevent.timing'); // Prevent timing attacks
      
      if (!user || !isValidPassword) {
        if (user) {
          await this.handleFailedLogin(user.id);
        }
        await this.logSecurityEvent('login_failed', { email });
        
        // Generic error message
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }
      
      // Check email verification
      if (!user.emailVerified) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Email not verified',
        });
      }
      
      // Reset failed attempts on successful login
      await this.resetFailedAttempts(user.id);
      
      // Create secure session
      const session = await this.createSecureSession(user);
      
      // Log successful login
      await this.logSecurityEvent('login_success', { 
        userId: user.id, 
        teamId: user.teamId 
      });
      
      return {
        user: this.sanitizeUser(user),
        session,
      };
    } catch (error) {
      // Handle database errors securely
      if (error instanceof TRPCError) throw error;
      
      await this.logSecurityEvent('login_error', { email, error: error.message });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication service unavailable',
      });
    }
  }
  
  private async createSecureSession(user: User): Promise<Session> {
    // Generate cryptographically secure token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // Hash tokens before storing
    const sessionTokenHash = await bcrypt.hash(sessionToken, 12);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const [session] = await db.insert(sessions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      teamId: user.teamId,
      tokenHash: sessionTokenHash,
      refreshTokenHash,
      expiresAt,
      refreshExpiresAt,
      userAgent: this.sanitizeUserAgent(request.headers['user-agent']),
      ipAddress: this.getClientIP(request),
    }).returning();
    
    return {
      sessionToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
    };
  }
  
  private async handleFailedLogin(userId: string): Promise<void> {
    const failedAttempts = await db.update(users)
      .set({
        failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ attempts: users.failedLoginAttempts });
    
    // Lock account after 5 failed attempts
    if (failedAttempts[0]?.attempts >= 5) {
      const lockDuration = 30 * 60 * 1000; // 30 minutes
      await db.update(users)
        .set({
          lockedUntil: new Date(Date.now() + lockDuration),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }
}
```

**Security Improvements**:
1. Rate limiting to prevent brute force attacks
2. Constant-time password comparison
3. Account lockout after failed attempts
4. Secure session token generation
5. Comprehensive security logging
6. Email verification requirement
7. Generic error messages to prevent information disclosure
```

## 🔐 Data Access Security Review

### Team Isolation Security Analysis

```markdown
**Task**: Review data access patterns for team isolation vulnerabilities

**Data Access Code**: [DATA_ACCESS_CODE_TO_REVIEW]

**Team Isolation Security Framework**:

**1. Mandatory Team Filtering**
- [ ] All queries include teamId filter
- [ ] No cross-team data access
- [ ] Admin operations scoped to team
- [ ] Bulk operations respect team boundaries

**2. Permission Validation**
- [ ] User permissions checked before access
- [ ] Role-based access implemented correctly
- [ ] Resource ownership validation
- [ ] API endpoint authorization

**3. Data Exposure Prevention**
- [ ] Sensitive fields excluded from responses
- [ ] PII protection implemented
- [ ] Error messages don't leak data
- [ ] Logging excludes sensitive information

**Example Security Analysis**:
```typescript
// ❌ Critical Security Vulnerabilities
export const userRouter = createTRPCRouter({
  // Issue: Missing team isolation!
  getAllUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // CRITICAL: No team filtering - exposes all users!
      return await ctx.db.query.users.findMany();
    }),
    
  // Issue: No permission validation
  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // CRITICAL: Can access any user regardless of team!
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id), // Missing team filter!
      });
      
      // Issue: Exposes sensitive data
      return user; // Includes password hash, session tokens, etc.
    }),
    
  // Issue: Admin operations without scope validation
  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // CRITICAL: No authorization check!
      // Anyone can delete any user!
      await ctx.db.delete(users).where(eq(users.id, input.id));
    }),
});

// ✅ Secure Implementation with Team Isolation
export const userRouter = createTRPCRouter({
  getTeamUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // ✅ Mandatory team filtering
      return await ctx.db.query.users.findMany({
        where: and(
          eq(users.teamId, ctx.session.teamId),
          isNull(users.deletedAt) // Exclude soft-deleted users
        ),
        columns: {
          // ✅ Exclude sensitive fields
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          // passwordHash: false,
          // sessionToken: false,
          // refreshToken: false,
        },
        orderBy: users.name,
      });
    }),
    
  getUserById: protectedProcedure
    .input(z.object({ 
      id: z.string().uuid('Invalid user ID format') 
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: and(
          eq(users.id, input.id),
          eq(users.teamId, ctx.session.teamId), // ✅ Team isolation
          isNull(users.deletedAt)
        ),
        columns: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found', // ✅ Generic error
        });
      }
      
      // ✅ Additional permission check for sensitive data
      const canViewDetails = ctx.session.userId === user.id || 
        ctx.session.role === 'admin';
      
      if (!canViewDetails) {
        // Return limited data for team members
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        };
      }
      
      return user;
    }),
    
  deleteUser: protectedProcedure
    .input(z.object({ 
      id: z.string().uuid() 
    }))
    .mutation(async ({ ctx, input }) => {
      // ✅ Authorization check
      if (ctx.session.role !== 'admin' && ctx.session.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }
      
      // ✅ Verify user exists and belongs to same team
      const userToDelete = await ctx.db.query.users.findFirst({
        where: and(
          eq(users.id, input.id),
          eq(users.teamId, ctx.session.teamId), // ✅ Team isolation
          isNull(users.deletedAt)
        ),
      });
      
      if (!userToDelete) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      // ✅ Prevent self-deletion
      if (userToDelete.id === ctx.session.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete your own account',
        });
      }
      
      // ✅ Prevent deleting team owner
      if (userToDelete.role === 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete team owner',
        });
      }
      
      // ✅ Soft delete for data integrity
      await ctx.db.update(users)
        .set({ 
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id));
      
      // ✅ Security audit log
      await ctx.db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        teamId: ctx.session.teamId,
        userId: ctx.session.userId,
        action: 'user.deleted',
        resourceType: 'user',
        resourceId: input.id,
        metadata: {
          deletedUserName: userToDelete.name,
          deletedUserEmail: userToDelete.email,
        },
        createdAt: new Date(),
      });
    }),
});
```

**Security Enhancements**:
1. Mandatory team isolation in all queries
2. Proper authorization checks
3. Sensitive data exclusion
4. Generic error messages
5. Soft delete for data integrity
6. Comprehensive audit logging
7. Permission-based data access
```

## 🌐 Frontend Security Review

### Client-Side Security Analysis

```markdown
**Task**: Review frontend code for security vulnerabilities

**Frontend Code**: [FRONTEND_CODE_TO_REVIEW]

**Frontend Security Checklist**:

**1. XSS Prevention**
- [ ] Input sanitization implemented
- [ ] HTML encoding for dynamic content
- [ ] Safe innerHTML usage
- [ ] CSP headers configured

**2. Authentication State Management**
- [ ] Secure token storage
- [ ] Automatic token refresh
- [ ] Proper logout implementation
- [ ] Session timeout handling

**3. API Security**
- [ ] CSRF protection
- [ ] Request validation
- [ ] Error handling without data exposure
- [ ] Rate limiting on client

**Example Security Analysis**:
```typescript
// ❌ Frontend Security Issues
function UserProfile({ userId }: { userId: string }) {
  const [userHtml, setUserHtml] = useState('');
  
  useEffect(() => {
    // Issue: No input validation
    fetch(`/api/users/${userId}`) // Issue: No CSRF protection
      .then(res => res.json())
      .then(user => {
        // CRITICAL: XSS vulnerability!
        setUserHtml(`<h1>${user.name}</h1><p>${user.bio}</p>`);
      })
      .catch(err => {
        // Issue: Error details exposed
        alert(`Error: ${err.message}`);
      });
  }, [userId]);
  
  return (
    <div>
      {/* CRITICAL: Dangerous HTML injection! */}
      <div dangerouslySetInnerHTML={{ __html: userHtml }} />
      
      {/* Issue: No rate limiting */}
      <button onClick={() => sendMessage(userId, message)}>
        Send Message
      </button>
    </div>
  );
}

// Issue: Insecure token storage
localStorage.setItem('token', authToken); // Vulnerable to XSS

// ✅ Secure Frontend Implementation
import DOMPurify from 'dompurify';
import { useTRPC } from '@/hooks/use-trpc';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function UserProfile({ userId }: { userId: string }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const trpc = useTRPC();
  
  // ✅ Input validation with TypeScript
  const validatedUserId = z.string().uuid().parse(userId);
  
  // ✅ Type-safe API call with error handling
  const { 
    data: user, 
    isLoading, 
    error 
  } = trpc.user.getById.useQuery(
    { id: validatedUserId },
    {
      enabled: !!validatedUserId,
      retry: false,
      onError: (error) => {
        // ✅ Generic error message
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive',
        });
      },
    }
  );
  
  // ✅ Rate-limited message sending
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });
  
  const handleSendMessage = useCallback(async (message: string) => {
    // ✅ Input validation
    if (!message.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        recipientId: validatedUserId,
        content: message.trim(),
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [validatedUserId, sendMessageMutation]);
  
  if (isLoading) {
    return <UserProfileSkeleton />;
  }
  
  if (error || !user) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* ✅ Safe content rendering */}
      <div>
        <h1 className="text-2xl font-bold">
          {user.name} {/* React automatically escapes */}
        </h1>
        
        {/* ✅ Sanitized HTML content */}
        {user.bio && (
          <div 
            className="prose"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(user.bio) 
            }} 
          />
        )}
      </div>
      
      {/* ✅ Conditional rendering based on permissions */}
      {currentUser?.id !== user.id && (
        <MessageForm
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isLoading}
          disabled={sendMessageMutation.isLoading}
        />
      )}
    </div>
  );
}

// ✅ Secure authentication state management
function useSecureAuth() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  
  useEffect(() => {
    // ✅ Secure token storage using httpOnly cookies
    // Tokens stored in httpOnly cookies (not accessible to JavaScript)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include httpOnly cookies
          headers: {
            'X-Requested-With': 'XMLHttpRequest', // CSRF protection
          },
        });
        
        if (response.ok) {
          const user = await response.json();
          setAuthState({ user, isAuthenticated: true });
        } else {
          setAuthState({ user: null, isAuthenticated: false });
        }
      } catch (error) {
        setAuthState({ user: null, isAuthenticated: false });
      }
    };
    
    checkAuth();
    
    // ✅ Auto-refresh session
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);
  
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } finally {
      setAuthState({ user: null, isAuthenticated: false });
      // Clear any client-side cache
      window.location.href = '/login';
    }
  }, []);
  
  return { ...authState, logout };
}
```

**Security Improvements**:
1. Input validation and sanitization
2. XSS prevention with DOMPurify
3. Secure token storage (httpOnly cookies)
4. CSRF protection headers
5. Generic error messages
6. Rate limiting on API calls
7. Proper session management
```

## 🔗 Related Resources

- [Performance Analysis Prompts](./performance-analysis.md)
- [Code Refactoring Prompts](./code-refactoring.md)
- [Code Review Prompts](../development/code-review.md)

<!-- AI-CONTEXT-BOUNDARY: end -->