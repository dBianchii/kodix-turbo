# Development Workflows & Processes

Este documento define os fluxos de trabalho, processos de desenvolvimento e práticas de CI/CD para o projeto Kodix.

## 🔄 Git Workflow

### Branch Strategy

```
main (production)
├── develop (integration)
├── feature/feature-name
├── fix/bug-description
├── refactor/component-name
└── docs/documentation-update
```

### Branch Types

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features and enhancements
- **`fix/*`**: Bug fixes
- **`refactor/*`**: Code refactoring without feature changes
- **`docs/*`**: Documentation updates

### Branch Naming Conventions

```bash
# ✅ Good: Descriptive and categorized
feature/user-authentication
feature/ai-studio-model-selection
fix/database-connection-timeout
fix/ui-button-disabled-state
refactor/api-error-handling
refactor/user-repository-queries
docs/update-development-guide
docs/add-backend-examples

# ❌ Avoid: Vague or unclear names
feature/new-stuff
fix/bug
update
wip
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

- **`feat`**: New features
- **`fix`**: Bug fixes
- **`docs`**: Documentation changes
- **`style`**: Code style changes (formatting, semicolons, etc.)
- **`refactor`**: Code refactoring
- **`test`**: Adding or updating tests
- **`chore`**: Build process or auxiliary tool changes

#### Examples

```bash
# ✅ Good: Clear and descriptive
feat(auth): add OAuth2 Google provider
fix(ui): resolve button disabled state styling
docs(api): update tRPC router documentation
refactor(db): optimize user queries with indexes
test(api): add user authentication tests
chore(deps): update dependencies to latest versions

# ✅ Good: With scope and breaking changes
feat(api)!: change user authentication to use sessions
fix(ui): resolve mobile navigation overflow issue
refactor(db): migrate from Prisma to Drizzle ORM

# ❌ Avoid: Vague or unclear messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "wip"
git commit -m "changes"
```

## 🚀 Feature Development Workflow

### 1. Planning Phase

1. **Create Issue**: Document requirements and acceptance criteria
2. **Design Review**: Discuss implementation approach with team
3. **Estimate Effort**: Size the work and plan sprint allocation

### 2. Development Phase

```bash
# 1. Create and switch to feature branch
git checkout develop
git pull origin develop
git checkout -b feature/user-profile-management

# 2. Implement changes following coding standards
# - Write tests first (TDD approach)
# - Follow TypeScript best practices
# - Use proper error handling
# - Add documentation

# 3. Commit changes incrementally
git add .
git commit -m "feat(user): add user profile data models"
git commit -m "feat(user): implement user profile API endpoints"
git commit -m "feat(user): add user profile UI components"
git commit -m "test(user): add user profile integration tests"

# 4. Keep branch updated
git checkout develop
git pull origin develop
git checkout feature/user-profile-management
git rebase develop
```

### 3. Testing Phase

```bash
# Run all checks before opening PR
pnpm lint:fix          # Fix linting issues
pnpm format:fix        # Format code
pnpm typecheck         # Check TypeScript types
pnpm test              # Run test suite
pnpm build             # Ensure builds successfully
```

### 4. Code Review Phase

```bash
# Push feature branch and create PR
git push origin feature/user-profile-management

# Create PR with proper template:
# - Clear description of changes
# - Link to related issues
# - Screenshots for UI changes
# - Test plan and verification steps
```

## 📋 Pull Request Process

### PR Template

```markdown
## 🎯 What does this PR do?

Brief description of the changes and their purpose.

## 🔗 Related Issues

- Closes #123
- Related to #456

## 🧪 How to test

1. Step-by-step instructions to test the changes
2. Include specific test cases
3. Mention any setup requirements

## 📷 Screenshots (if applicable)

Before and after screenshots for UI changes.

## ✅ Checklist

- [ ] Code follows the coding standards
- [ ] Tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Accessibility considerations addressed
- [ ] Performance implications considered
```

### Review Process

1. **Automated Checks**: CI pipeline runs tests, linting, and builds
2. **Code Review**: At least one team member reviews the code
3. **Testing**: QA team tests the changes (if applicable)
4. **Approval**: PR approved by reviewers
5. **Merge**: Squash and merge to develop branch

### Review Guidelines

#### For Reviewers

```markdown
# ✅ Good: Constructive feedback

Consider extracting this logic into a custom hook for better reusability across components.

This database query might benefit from an index on the `created_at` column for better performance with large datasets.

The error handling here could be more specific. Consider catching different error types and providing appropriate user feedback.

# ✅ Good: Ask questions for clarification

What happens if the API returns null here? Should we have a fallback?

Is there a specific reason for using `any` type here? Could we be more specific?

# ❌ Avoid: Non-constructive comments

This is wrong.
Bad approach.
Fix this.
```

#### For Authors

- **Respond to all comments** before requesting re-review
- **Explain reasoning** for implementation choices when asked
- **Be open to suggestions** and alternative approaches
- **Update documentation** when making changes based on feedback

## 🏗️ CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security audit
        run: pnpm audit

      - name: Check for vulnerabilities
        run: pnpm audit --audit-level high

  deploy-staging:
    needs: [quality, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging environment"

  deploy-production:
    needs: [quality, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploy to production environment"
```

### Pipeline Stages

1. **Code Quality**: Linting, formatting, type checking
2. **Testing**: Unit tests, integration tests, e2e tests
3. **Security**: Dependency audit, vulnerability scanning
4. **Build**: Compile and bundle applications
5. **Deploy**: Deploy to staging/production environments

### Environment Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Development │    │   Staging   │    │ Production  │
│  (Local)    │───▶│ (develop)   │───▶│   (main)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚦 Release Process

### Semantic Versioning

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version numbers
# - package.json files
# - CHANGELOG.md
# - Documentation

# 3. Final testing and bug fixes
pnpm test
pnpm build
# Fix any critical issues

# 4. Merge to main and tag
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags

# 5. Merge back to develop
git checkout develop
git merge main
git push origin develop

# 6. Deploy to production (automated via CI/CD)
```

### Hotfix Process

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Implement fix and test
# Make minimal changes to fix the issue
pnpm test

# 3. Merge to main and develop
git checkout main
git merge hotfix/critical-security-fix
git tag v1.2.1
git push origin main --tags

git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# 4. Deploy immediately (automated)
```

## 🔍 Quality Assurance

### Code Quality Checks

```bash
# Pre-commit hooks (using husky)
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type checking
pnpm typecheck

# Run linting and fix issues
pnpm lint:fix

# Run formatting
pnpm format:fix

# Run tests
pnpm test --passWithNoTests
```

### Testing Strategy

#### Unit Tests

- Test individual functions and components
- Mock external dependencies
- High code coverage (>80%)

#### Integration Tests

- Test API endpoints
- Test database operations
- Test component interactions

#### E2E Tests

- Test critical user journeys
- Test across different browsers
- Test mobile responsiveness

### Performance Monitoring

```typescript
// Performance budgets in CI
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

## 📊 Monitoring & Observability

### Error Tracking

```typescript
// Sentry configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

```typescript
// PostHog analytics
import { PostHog } from "posthog-node";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
```

### Health Checks

```typescript
// API health check endpoint
export async function GET() {
  try {
    // Check database connection
    await db.select().from(users).limit(1);

    // Check external services
    await fetch(process.env.EXTERNAL_API_URL);

    return Response.json({ status: "healthy", timestamp: new Date() });
  } catch (error) {
    return Response.json(
      { status: "unhealthy", error: error.message },
      { status: 503 },
    );
  }
}
```

## 🔒 Security Practices

### Security Scanning

```bash
# Regular security audits
pnpm audit
npm audit fix

# Dependency vulnerability scanning
snyk test
snyk monitor
```

### Environment Security

```bash
# Environment variables validation
#!/bin/bash
required_vars=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "Error: $var is not set"
    exit 1
  fi
done
```

## 📚 Documentation Updates

### Documentation Workflow

1. **Code Changes**: Update relevant documentation
2. **API Changes**: Update API documentation
3. **Process Changes**: Update workflow documentation
4. **Review**: Include docs in code review process

### Documentation Standards

- Keep documentation close to code
- Use examples and code snippets
- Update README files for packages
- Maintain architecture decision records (ADRs)

---

_This workflow document should evolve with the team and project needs._
