# 🗄️ Database Documentation

Complete MySQL database documentation using Drizzle ORM, organized for different use cases and experience levels.

## 📚 Documentation

### [Getting Started](./getting-started.md)

Set up the MySQL database from scratch

- Environment variables configuration
- Docker MySQL setup
- Schema application and seeds
- Troubleshooting guide

### [Development Workflow](./development-workflow.md)

Work efficiently with branches and schema changes

- Push vs Generate vs Migrate
- Branch synchronization
- Team collaboration
- Productivity scripts

### [Drizzle Studio](./drizzle-studio.md)

Visual interface to explore and edit data

- Interface navigation
- CRUD operations
- Custom SQL queries
- Connection troubleshooting

### [Production Migrations](./production-migrations.md)

Safe deployment of schema changes

- Versioned migration process
- Backup and rollback
- CI/CD integration
- Safe deployment strategies

### [Schema Reference](./schema-reference.md)

Complete technical schema documentation

- Full database structure
- Table relationships
- Indexes and performance
- Best practices

## 🛠️ Tech Stack

### **Core Database**

- **MySQL 8.2** - Primary database
- **Drizzle ORM** - Type-safe database toolkit
- **Docker** - Local MySQL via docker-compose

### **Development Environment**

- **Drizzle Studio** - Visual interface for data
- **Push/Migrate** - Different workflow per environment
- **Seeds** - Automatic data population

### **Production**

- **Versioned Migrations** - Controlled deployment
- **Automatic Backup** - Data safety
- **Monitoring** - Health checks and metrics

## 📊 Database Applications

### **🔐 Authentication**

- **users** - System users
- **accounts** - OAuth accounts (NextAuth.js)
- **sessions** - Active sessions

### **👥 Organization**

- **teams** - Teams/organizations (multi-tenancy)
- **team_members** - Members and permissions

### **🤖 AI Studio**

- **ai_provider** - AI providers (OpenAI, Anthropic, etc.)
- **ai_model** - Available models per provider
- **ai_team_provider_token** - API tokens per team

### **💬 Chat**

- **chat_folder** - Conversation organization
- **chat_conversation** - Chat sessions
- **chat_message** - Messages and history

### **📅 Calendar**

- **calendar_event** - Events and appointments
- **calendar_event_attendee** - Participants

### **🏥 KodixCare**

- **patients** - Patients and medical information
- **appointments** - Scheduled consultations

### **✅ Todos**

- **todo** - Tasks and reminders

## 🚀 Quick Commands

```bash
# 🛠️ Development
pnpm run db:push     # Apply schema changes
pnpm run db:studio   # Open visual interface
pnpm run db:sync     # Sync with branch

# 📦 Setup
pnpm run db:seed     # Populate with initial data
pnpm run db:reset    # Complete database reset

# 🏗️ Production
pnpm db:generate     # Generate migration
pnpm db:migrate      # Apply to production
```

## 🆘 Need Help?

| Situation                               | Document                                            |
| --------------------------------------- | --------------------------------------------------- |
| Setting up project for the first time   | [Getting Started](./getting-started.md)             |
| Working on branches with schema changes | [Development Workflow](./development-workflow.md)   |
| View/edit data in database              | [Drizzle Studio](./drizzle-studio.md)               |
| Understanding structure of a table      | [Schema Reference](./schema-reference.md)           |
| Deploying schema changes                | [Production Migrations](./production-migrations.md) |

## 🎓 Learning Path

### **👶 Beginner (First time on project)**

1. [Getting Started](./getting-started.md) - Set everything up
2. [Drizzle Studio](./drizzle-studio.md) - Explore data visually
3. [Schema Reference](./schema-reference.md) - Understand structure

### **👩‍💻 Regular Development**

1. [Development Workflow](./development-workflow.md) - Daily use
2. [Drizzle Studio](./drizzle-studio.md) - Debug and inspection
3. [Schema Reference](./schema-reference.md) - Technical reference

### **🚀 Tech Lead / DevOps**

1. [Production Migrations](./production-migrations.md) - Safe deployment
2. [Development Workflow](./development-workflow.md) - PR reviews
3. [Schema Reference](./schema-reference.md) - Architectural decisions

## 🔗 Related Documentation

- **Architecture** - `docs/architecture/` - Overall system architecture
- **APIs** - `docs/api/` - API documentation that uses the database
- **Subapps** - `docs/subapps/` - How each app uses the database

---

**📝 Last updated**: January 2025 | **🛠️ Stack**: MySQL + Drizzle ORM | **🐳 Environment**: Docker
