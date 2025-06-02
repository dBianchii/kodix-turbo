# Detalhes Técnicos - AI Studio

## 📐 Visão Geral

Detalhes técnicos específicos da implementação do AI Studio, incluindo schemas de banco, criptografia e configurações específicas.

## 🗄️ Schemas das Tabelas

### **Provedores de IA**

```sql
CREATE TABLE ai_provider (
  id VARCHAR(30) PRIMARY KEY,
  teamId VARCHAR(30) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('OPENAI', 'ANTHROPIC', 'GOOGLE', 'AZURE'),
  enabled BOOLEAN DEFAULT true,
  config JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Modelos de IA**

```sql
CREATE TABLE ai_model (
  id VARCHAR(30) PRIMARY KEY,
  teamId VARCHAR(30) NOT NULL,
  providerId VARCHAR(30) NOT NULL,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  maxTokens INTEGER,
  config JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (providerId) REFERENCES ai_provider(id)
);
```

### **Agentes IA**

```sql
CREATE TABLE ai_agent (
  id VARCHAR(30) PRIMARY KEY,
  teamId VARCHAR(30) NOT NULL,
  modelId VARCHAR(30) NOT NULL,
  name VARCHAR(255) NOT NULL,
  systemPrompt TEXT,
  enabled BOOLEAN DEFAULT true,
  config JSON,
  createdById VARCHAR(30) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modelId) REFERENCES ai_model(id)
);
```

### **Tokens Criptografados**

```sql
CREATE TABLE ai_team_provider_token (
  id VARCHAR(30) PRIMARY KEY,
  teamId VARCHAR(30) NOT NULL,
  providerId VARCHAR(30) NOT NULL,
  encryptedToken TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teamId, providerId),
  FOREIGN KEY (providerId) REFERENCES ai_provider(id)
);
```

## 🔒 Implementação de Criptografia

### **AES-256-GCM para Tokens**

**Localização:** `packages/db/src/utils/crypto.ts`

```typescript
function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher("aes-256-gcm", key);
  cipher.setAAD(Buffer.from("ai-studio-token", "utf8"));

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipher("aes-256-gcm", key);
  decipher.setAAD(Buffer.from("ai-studio-token", "utf8"));
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

### **Configuração de Ambiente**

```bash
# Produção - chave aleatória segura
export ENCRYPTION_KEY=$(openssl rand -base64 32)

# Desenvolvimento - chave fixa para consistência
export ENCRYPTION_KEY="development-key-32-chars-long"
```

## ⚙️ Configurações Específicas do AI Studio

### **Variáveis de Ambiente**

```bash
# Criptografia (obrigatória)
ENCRYPTION_KEY=your-32-char-encryption-key

# Provedores (opcionais para seed)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-key
```

### **Configuração por Provedor**

```typescript
// OpenAI
{
  baseUrl: "https://api.openai.com/v1",
  version: "v1"
}

// Anthropic
{
  baseUrl: "https://api.anthropic.com",
  version: "2023-06-01"
}

// Azure OpenAI
{
  baseUrl: "https://your-resource.openai.azure.com",
  version: "2023-12-01-preview",
  deploymentId: "your-deployment"
}
```

## 🚀 Performance e Otimizações

### **Índices de Database**

```sql
CREATE INDEX ai_model_provider_enabled_idx ON ai_model(providerId, enabled);
CREATE INDEX ai_agent_team_created_idx ON ai_agent(teamId, createdAt DESC);
CREATE INDEX ai_token_team_provider_idx ON ai_team_provider_token(teamId, providerId);
```

### **Cache Reativo**

```typescript
const { data } = useQuery({
  queryKey: ["ai-providers", teamId],
  queryFn: () => trpc.app.aiStudio.findAiProviders.query(),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

## 🔗 Integrações Específicas

### **Provedores de IA Suportados**

- **OpenAI API**: Chat, completions, embeddings
- **Anthropic Claude**: Messages API
- **Google AI**: Gemini API
- **Azure OpenAI**: Managed OpenAI services

### **Integração com Outros Módulos**

- **Chat System**: Usa modelos e agentes do AI Studio
- **Analytics**: Métricas de uso dos recursos
- **Teams**: Isolamento e permissões por equipe
- **Billing**: Tracking de uso para cobrança
