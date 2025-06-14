# Funcionalidade de Edição de Sessões de Chat

## Visão Geral

Foi implementada uma funcionalidade completa de edição de sessões de chat no sidebar da aplicação Kodix Chat. Esta funcionalidade permite aos usuários editar todos os parâmetros de uma sessão existente, incluindo título, modelo de IA, agente, e pasta.

## Funcionalidades Implementadas

### 1. **Edição de Sessões**

- **Título do Chat**: Permite alterar o nome da sessão
- **Modelo de IA**: Trocar entre diferentes modelos disponíveis (GPT-4, Claude, Gemini, etc.)
- **Agente (Opcional)**: Selecionar ou remover agentes configurados
- **Pasta (Opcional)**: Mover para pasta ou remover de pasta

### 2. **Interface de Usuário**

#### Menu de Contexto

- Botão "três pontos" aparece no hover sobre cada sessão
- Opções disponíveis:
  - ✏️ **Editar** - Abre modal de edição
  - 📁 **Mover para pasta** - Move sessão para pasta existente
  - 🗑️ **Excluir** - Remove sessão (com confirmação)

#### Modal de Edição

- Interface intuitiva com todos os campos editáveis
- Dropdowns populados com dados atuais
- Validação em tempo real
- Feedback visual durante operações

### 3. **Localização das Opções**

#### Sessões sem Pasta (Seção "Chats")

```typescript
<DropdownMenuContent align="end">
  <DropdownMenuItem onClick={handleEditSession}>
    <Pencil className="mr-2 h-4 w-4" />
    Editar
  </DropdownMenuItem>
  <DropdownMenuItem onClick={handleMoveSession}>
    <Folder className="mr-2 h-4 w-4" />
    Mover para pasta
  </DropdownMenuItem>
  <DropdownMenuItem onClick={handleDeleteSession}>
    <Trash2 className="mr-2 h-4 w-4" />
    Excluir
  </DropdownMenuItem>
</DropdownMenuContent>
```

#### Sessões dentro de Pastas

```typescript
<DropdownMenuContent align="end">
  <DropdownMenuItem onClick={onEditSession}>
    <Pencil className="mr-2 h-4 w-4" />
    Editar
  </DropdownMenuItem>
  <DropdownMenuItem onClick={onDeleteSession}>
    <Trash2 className="mr-2 h-4 w-4" />
    Excluir
  </DropdownMenuItem>
</DropdownMenuContent>
```

## Implementação Técnica

### 1. **Estados Adicionados**

```typescript
const [showEditSession, setShowEditSession] = useState(false);
const [editingSession, setEditingSession] = useState<any>(null);
```

### 2. **Mutation para Atualização**

```typescript
const updateSessionMutation = useMutation(
  trpc.app.chat.atualizarSession.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.app.chat.listarSessions.pathFilter());
      toast.success("Sessão atualizada com sucesso!");
      // Reset form states
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar sessão");
    },
  }),
);
```

### 3. **Handler de Edição**

```typescript
const handleEditSession = (session: any) => {
  setEditingSession(session);
  setSessionTitle(session.title);
  setSelectedAgent(session.aiAgentId || "none");
  setSelectedModel(session.aiModelId || "");
  setSelectedFolderId(session.chatFolderId || "none");
  setShowEditSession(true);
};

const handleUpdateSession = () => {
  if (editingSession && sessionTitle.trim() && selectedModel) {
    updateSessionMutation.mutate({
      id: editingSession.id,
      title: sessionTitle.trim(),
      chatFolderId: selectedFolderId === "none" ? undefined : selectedFolderId,
      aiAgentId: selectedAgent === "none" ? undefined : selectedAgent,
      aiModelId: selectedModel,
    });
  }
};
```

### 4. **Modal de Edição**

```typescript
<Dialog open={showEditSession} onOpenChange={setShowEditSession}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Editar Chat</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* Título */}
      <div>
        <Label htmlFor="editSessionTitle">Título do Chat</Label>
        <Input
          id="editSessionTitle"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="Ex: Consulta sobre IA"
        />
      </div>

      {/* Pasta */}
      <div>
        <Label htmlFor="editFolderSelect">Pasta (Opcional)</Label>
        <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma pasta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem pasta</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agente */}
      <div>
        <Label htmlFor="editAgentSelect">Agente (Opcional)</Label>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um agente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem agente</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modelo */}
      <div>
        <Label htmlFor="editModelSelect">Modelo de IA</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um modelo" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.provider?.name || "Provider"} - {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowEditSession(false)}>
        Cancelar
      </Button>
      <Button
        onClick={handleUpdateSession}
        disabled={
          !sessionTitle.trim() ||
          !selectedModel ||
          updateSessionMutation.isPending
        }
      >
        {updateSessionMutation.isPending ? "Atualizando..." : "Atualizar"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Melhorias na UX

### 1. **Estados de Loading**

- Indicador visual durante atualização
- Botões desabilitados durante operações
- Feedback de sucesso/erro via toast

### 2. **Validação**

- Título obrigatório (não pode estar vazio)
- Modelo obrigatório
- Campos opcionais podem ser removidos com "none"

### 3. **Propagação de Eventos**

- `stopPropagation()` nos botões de ação
- Evita seleção acidental da sessão ao editar

### 4. **Sincronização de Cache**

- `invalidateQueries` após operações
- UI sempre atualizada com dados mais recentes

## Casos de Uso

### 1. **Trocar Modelo de IA**

- Usuário pode experimentar diferentes modelos para uma conversa existente
- Histórico de mensagens é preservado
- Nova configuração se aplica a próximas mensagens

### 2. **Organizar Sessões**

- Mover sessões entre pastas
- Renomear para melhor organização
- Atribuir agentes específicos

### 3. **Configurar Agentes**

- Adicionar agente a sessão existente
- Remover agente quando não necessário
- Trocar entre diferentes agentes

## Compatibilidade

### 1. **tRPC Integration**

- Usa mutation `trpc.app.chat.atualizarSession`
- Cache management automático
- Error handling integrado

### 2. **UI Components**

- Componentes shadcn/ui padrão
- Tema consistente com resto da aplicação
- Responsivo e acessível

### 3. **Backend Support**

- Endpoint existente suporta todos os campos
- Validação no backend
- Relacionamentos preservados

## Como Testar

### 1. **Acesso**

```bash
# Iniciar desenvolvimento
pnpm dev:kdx

# Acessar aplicação
http://localhost:3000/apps/chat
```

### 2. **Testes de Funcionalidade**

#### Editar Sessão:

1. Passe o mouse sobre qualquer sessão no sidebar
2. Clique no botão "três pontos" (⋯)
3. Selecione "Editar"
4. Modifique os campos desejados
5. Clique "Atualizar"
6. Verifique que mudanças foram aplicadas

#### Trocar Modelo:

1. Edite uma sessão existente
2. Selecione um modelo diferente
3. Envie uma nova mensagem
4. Verifique badge no cabeçalho mostra novo modelo

#### Mover entre Pastas:

1. Use "Editar" para mover sessão para pasta
2. Ou use "Mover para pasta" para ação rápida
3. Verifique que sessão aparece na pasta correta

### 3. **Validação de Estados**

- Teste com campos vazios (deve impedir submissão)
- Teste durante loading (botões devem estar desabilitados)
- Teste mensagens de erro (simule falhas de rede)

## Próximos Passos

### 1. **Melhorias Futuras**

- **Bulk Operations**: Editar múltiplas sessões simultaneamente
- **Templates**: Salvar configurações como templates
- **Histórico**: Log de mudanças de configuração
- **Permissões**: Controle de quem pode editar sessões

### 2. **Otimizações**

- **Cache Granular**: Invalidar apenas dados específicos
- **Optimistic Updates**: Atualizar UI antes da confirmação
- **Debounced Search**: Para filtros de modelos/agentes

### 3. **Funcionalidades Avançadas**

- **Duplicate Session**: Clonar configuração de sessão
- **Export/Import**: Backup de configurações
- **Session Templates**: Configurações predefinidas
- **Auto-suggestions**: Sugerir modelos baseado no conteúdo

## Conclusão

A funcionalidade de edição de sessões de chat oferece aos usuários controle total sobre suas conversas, permitindo:

✅ **Flexibilidade**: Trocar modelos e agentes conforme necessário
✅ **Organização**: Mover e renomear sessões facilmente  
✅ **Experimentação**: Testar diferentes configurações
✅ **Produtividade**: Gerenciar sessões sem perder histórico

A implementação é robusta, escalável e mantém consistência com o resto da aplicação Kodix, proporcionando uma experiência de usuário superior e mais produtiva.
