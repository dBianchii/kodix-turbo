# Banco de Dados - Projeto Kodix

## Visão Geral

O projeto Kodix utiliza PostgreSQL como banco de dados principal, gerenciado através do Prisma ORM. Esta documentação detalha a estrutura, relacionamentos e práticas recomendadas para o banco de dados.

## Configuração

### Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/kodix_db"

# Para desenvolvimento local
POSTGRES_USER=kodix_user
POSTGRES_PASSWORD=sua_senha
POSTGRES_DB=kodix_dev

# Para testes
DATABASE_URL_TEST="postgresql://usuario:senha@localhost:5432/kodix_test"
```

### Setup Local com Docker

```yaml
# docker-compose.yml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Estrutura do Schema

### Modelos Principais

#### User (Usuário)

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  emailVerified     DateTime?
  image             String?
  role              Role     @default(USER)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relacionamentos
  accounts          Account[]
  sessions          Session[]
  patients          Patient[]
  appointments      Appointment[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
  DOCTOR
  NURSE
  RECEPTIONIST
}
```

#### Patient (Paciente)

```prisma
model Patient {
  id                String   @id @default(cuid())
  name              String
  email             String?  @unique
  phone             String?
  cpf               String?  @unique
  dateOfBirth       DateTime?
  gender            Gender?
  address           String?
  emergencyContact  String?
  medicalHistory    String?
  allergies         String?
  medications       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relacionamentos
  createdBy         String
  creator           User     @relation(fields: [createdBy], references: [id])
  appointments      Appointment[]
  medicalRecords    MedicalRecord[]

  @@map("patients")
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}
```

#### Appointment (Consulta)

```prisma
model Appointment {
  id                String            @id @default(cuid())
  dateTime          DateTime
  duration          Int               @default(30) // em minutos
  status            AppointmentStatus @default(SCHEDULED)
  type              AppointmentType   @default(CONSULTATION)
  notes             String?
  symptoms          String?
  diagnosis         String?
  treatment         String?
  followUpDate      DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  // Relacionamentos
  patientId         String
  patient           Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)
  doctorId          String
  doctor            User              @relation(fields: [doctorId], references: [id])
  medicalRecords    MedicalRecord[]

  @@map("appointments")
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum AppointmentType {
  CONSULTATION
  FOLLOW_UP
  EMERGENCY
  ROUTINE_CHECKUP
  VACCINATION
  PROCEDURE
}
```

#### MedicalRecord (Prontuário)

```prisma
model MedicalRecord {
  id                String   @id @default(cuid())
  title             String
  content           String
  type              RecordType
  attachments       String[] // URLs dos arquivos
  isPrivate         Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relacionamentos
  patientId         String
  patient           Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointmentId     String?
  appointment       Appointment? @relation(fields: [appointmentId], references: [id])
  createdById       String
  createdBy         User        @relation(fields: [createdById], references: [id])

  @@map("medical_records")
}

enum RecordType {
  CONSULTATION_NOTES
  PRESCRIPTION
  LAB_RESULTS
  IMAGING
  VACCINATION_RECORD
  PROCEDURE_NOTES
  DISCHARGE_SUMMARY
}
```

### Relacionamentos

```mermaid
erDiagram
    User ||--o{ Patient : creates
    User ||--o{ Appointment : attends
    Patient ||--o{ Appointment : has
    Patient ||--o{ MedicalRecord : owns
    Appointment ||--o{ MedicalRecord : generates
    User ||--o{ MedicalRecord : creates
```

## Migrações

### Comandos Prisma

```bash
# Gerar migração
pnpm prisma migrate dev --name nome_da_migracao

# Aplicar migrações
pnpm prisma migrate deploy

# Reset do banco (desenvolvimento)
pnpm prisma migrate reset

# Gerar client
pnpm prisma generate

# Visualizar dados
pnpm prisma studio
```

### Exemplo de Migração

```sql
-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "address" TEXT,
    "emergency_contact" TEXT,
    "medical_history" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);
```

## Seeds e Dados Iniciais

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@kodix.com" },
    update: {},
    create: {
      email: "admin@kodix.com",
      name: "Administrador",
      role: Role.ADMIN,
    },
  });

  // Criar dados de exemplo para desenvolvimento
  if (process.env.NODE_ENV === "development") {
    // Pacientes de exemplo
    await prisma.patient.createMany({
      data: [
        {
          name: "João Silva",
          email: "joao@example.com",
          phone: "11999999999",
          cpf: "123.456.789-00",
          createdBy: admin.id,
        },
        // ... mais pacientes
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Práticas Recomendadas

### Performance

1. **Índices**

```prisma
model Patient {
  // ...
  @@index([email])
  @@index([cpf])
  @@index([createdAt])
}
```

2. **Paginação**

```typescript
// Usar cursor-based pagination para datasets grandes
const patients = await prisma.patient.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: "desc" },
});
```

3. **Seleção de campos**

```typescript
// Selecionar apenas campos necessários
const patients = await prisma.patient.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### Segurança

1. **Validação de entrada**

```typescript
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .optional(),
});
```

2. **Auditoria**

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  action    String
  table     String
  recordId  String
  oldData   Json?
  newData   Json?
  userId    String
  timestamp DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

### Backup e Recuperação

```bash
# Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauração
psql $DATABASE_URL < backup_file.sql
```

## Monitoramento

### Métricas importantes

- Tempo de resposta das queries
- Conexões ativas
- Tamanho do banco de dados
- Queries lentas

### Logs

```typescript
// Configuração de logs no Prisma
const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
  ],
});

prisma.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});
```

---

Esta documentação deve ser atualizada sempre que houver mudanças no schema do banco de dados.
