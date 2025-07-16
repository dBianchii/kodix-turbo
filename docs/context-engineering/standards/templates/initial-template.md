# INITIAL.md Template

<!-- AI-METADATA:
category: templates
complexity: basic
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🎯 Purpose

Template for creating INITIAL.md files that capture feature requests and requirements in a structured format optimized for AI-driven development with the PRP workflow.

## 📋 Complete INITIAL.md Template

```markdown
# Feature Request: [Feature Name]

<!-- AI-METADATA:
category: planning
complexity: [basic|intermediate|advanced]
updated: YYYY-MM-DD
claude-ready: true
priority: [high|medium|low]
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🎯 Feature Overview

**Brief Description**: One-sentence description of what this feature accomplishes.

**Business Value**: Why this feature matters and what problem it solves.

## 📋 Requirements

### Functional Requirements
- [ ] **Requirement 1**: Specific functionality needed
- [ ] **Requirement 2**: Another specific functionality
- [ ] **Requirement 3**: Additional functionality

### Non-Functional Requirements
- [ ] **Performance**: Response time and throughput requirements
- [ ] **Security**: Authentication, authorization, data protection
- [ ] **Scalability**: Expected load and growth considerations
- [ ] **Usability**: User experience and accessibility requirements

## 🏗️ Technical Context

### Affected Systems
- **SubApp**: [Primary SubApp this feature belongs to]
- **Dependencies**: [Other systems this feature depends on]
- **Integration Points**: [How this connects to existing systems]

### Technology Stack
- **Frontend**: [React components, pages, hooks needed]
- **Backend**: [tRPC routers, procedures, services needed]
- **Database**: [New tables, modifications, migrations needed]
- **External Services**: [APIs, third-party integrations needed]

## 👥 User Stories

### Primary User Flow
```
As a [user type]
I want to [action]
So that [benefit]
```

### Additional Scenarios
- **Scenario 1**: [Description of use case]
- **Scenario 2**: [Description of another use case]
- **Scenario 3**: [Edge case or alternative flow]

## 🎨 UI/UX Requirements

### User Interface
- **New Pages**: [List of new pages needed]
- **Component Updates**: [Existing components to modify]
- **Navigation**: [How users access this feature]
- **Responsive Design**: [Mobile/desktop considerations]

### User Experience
- **Workflow**: [Step-by-step user journey]
- **Feedback**: [User feedback and confirmation patterns]
- **Error Handling**: [Error states and recovery]
- **Loading States**: [Loading and async state management]

## 🔐 Security & Permissions

### Access Control
- **Team Isolation**: [How feature respects team boundaries]
- **User Permissions**: [Who can access what functionality]
- **Data Protection**: [Sensitive data handling]
- **Audit Requirements**: [Logging and tracking needs]

## 📊 Data Requirements

### New Data Models
```typescript
// Example data structure
interface NewFeatureData {
  id: string;
  teamId: string; // Required for team isolation
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Data Operations
- **Create**: [What data gets created]
- **Read**: [What data gets queried]
- **Update**: [What data gets modified]
- **Delete**: [What data gets removed]

## 🔌 API Requirements

### New tRPC Procedures
- `feature.create` - Create new feature instance
- `feature.findMany` - List features for team
- `feature.findById` - Get specific feature
- `feature.update` - Update feature data
- `feature.delete` - Remove feature

### Integration APIs
- **Internal**: [Other SubApp APIs to use]
- **External**: [Third-party APIs required]
- **Webhooks**: [Event notifications needed]

## ✅ Acceptance Criteria

### Feature Complete When:
- [ ] **Core Functionality**: All functional requirements implemented
- [ ] **UI Implementation**: All user interface requirements met
- [ ] **API Coverage**: All required endpoints implemented
- [ ] **Security**: Team isolation and permissions working
- [ ] **Testing**: Unit and integration tests passing
- [ ] **Documentation**: Feature documentation updated

### Quality Standards
- [ ] **Type Safety**: No `any` types, full TypeScript coverage
- [ ] **ESLint Clean**: No linting errors or warnings
- [ ] **Performance**: Meets Kodix performance standards
- [ ] **Accessibility**: WCAG compliance where applicable
- [ ] **Responsive**: Works on mobile and desktop
- [ ] **Error Handling**: Graceful error states and recovery

## 🧪 Testing Requirements

### Test Coverage
- [ ] **Unit Tests**: Component and function testing
- [ ] **Integration Tests**: API and database testing
- [ ] **E2E Tests**: Full user workflow testing
- [ ] **Performance Tests**: Load and response time testing

### Test Scenarios
- **Happy Path**: Normal usage flows
- **Error Cases**: Invalid input and error conditions
- **Edge Cases**: Boundary conditions and unusual inputs
- **Security**: Permission and access control testing

## 🚀 Implementation Notes

### Development Approach
- **Architecture**: [How this fits into existing architecture]
- **Patterns**: [Specific patterns to follow]
- **Migrations**: [Database or data migration needs]
- **Deployment**: [Special deployment considerations]

### Known Constraints
- **Technical Limitations**: [Any technical constraints]
- **Resource Constraints**: [Time or resource limitations]
- **Compatibility**: [Backwards compatibility needs]
- **Dependencies**: [External dependency considerations]

## 📅 Timeline Estimate

### Development Phases
- **Phase 1**: [Initial implementation scope and timeline]
- **Phase 2**: [Additional features and timeline]
- **Phase 3**: [Polish and optimization timeline]

### Key Milestones
- **MVP**: [Minimum viable product completion]
- **Beta**: [Beta testing readiness]
- **Production**: [Production deployment readiness]

## 🔗 Related Resources

### Existing Documentation
- **[Related Feature](../path/to/related.md)** - Similar patterns or integration
- **[Architecture Guide](../architecture/guide.md)** - Relevant architectural patterns
- **[API Patterns](../api/patterns.md)** - API design guidance

### Design Resources
- **[Design System](../design/system.md)** - UI component patterns
- **[User Research](../research/findings.md)** - User research insights
- **[Mockups](../design/mockups.md)** - Visual design references

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Next Step**: Use `/generate-prp` command to create implementation blueprint  
**Status**: [Draft|Review|Approved]  
**Last Updated**: YYYY-MM-DD
```

## 🎯 Template Usage Guidelines

### When to Use INITIAL.md
- **New Feature Requests**: Capturing requirements for new functionality
- **Feature Enhancement**: Documenting improvements to existing features
- **Cross-SubApp Features**: Features spanning multiple SubApps
- **Complex Implementations**: Features requiring detailed planning

### Template Customization

#### For Simple Features
- Simplify sections that don't apply
- Focus on core requirements and acceptance criteria
- Reduce technical complexity sections

#### For Complex Features
- Expand technical context and requirements
- Add detailed user stories and scenarios
- Include comprehensive testing requirements
- Add architectural decision records

#### For UI-Heavy Features
- Expand UI/UX requirements section
- Add detailed component specifications
- Include design system integration notes
- Specify responsive design requirements

#### For API-Focused Features
- Expand API requirements section
- Add detailed endpoint specifications
- Include authentication and authorization details
- Specify data validation requirements

## ✅ Quality Checklist

### Required Completeness
- [ ] **Clear Feature Description**: Unambiguous feature definition
- [ ] **Complete Requirements**: All functional and non-functional requirements
- [ ] **Technical Context**: Sufficient technical information for implementation
- [ ] **Acceptance Criteria**: Specific, measurable completion criteria

### Quality Standards
- [ ] **User-Centered**: Requirements focus on user value and experience
- [ ] **Implementation-Ready**: Provides enough detail for development
- [ ] **Testable**: Requirements can be verified through testing
- [ ] **Maintainable**: Considers long-term maintenance and evolution

### AI Optimization
- [ ] **Structured Information**: Clear sections and bullet points
- [ ] **Complete Context**: All necessary information for AI understanding
- [ ] **Implementation Guidance**: Specific patterns and approaches
- [ ] **Validation Criteria**: Clear success measures

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Usage**: Use this template for all feature requests in the PRP workflow  
**Integration**: Compatible with `/generate-prp` and `/execute-prp` commands  
**Related**: [PRP Template](./prp-template.md) | [Context Engineering Methodology](../context-engineering-methodology.md)  
**Last Updated**: 2025-07-13