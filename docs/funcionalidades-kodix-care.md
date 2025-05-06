# Funcionalidades do Kodix Care

O Kodix Care é um aplicativo móvel desenvolvido com React Native e Expo, focado na gestão de cuidados para profissionais de saúde e pacientes. Este documento detalha as principais funcionalidades e integrações do sistema.

## Visão Geral

O aplicativo Kodix Care foi criado para facilitar a comunicação entre profissionais de saúde e pacientes, permitindo agendamento de consultas, monitoramento de pacientes, registro de medicamentos e acompanhamento de tratamentos. A aplicação se integra com o backend principal através de APIs tRPC tipadas.

## Funcionalidades Principais

### Gestão de Pacientes

- **Cadastro de Pacientes**: Dados pessoais, histórico médico, alergias e medicamentos
- **Perfil do Paciente**: Visualização centralizada de informações do paciente
- **Lista de Pacientes**: Visualização rápida com filtros e busca
- **Histórico de Atendimentos**: Registro completo de todas as interações com o paciente

### Agendamento

- **Calendário Integrado**: Visualização diária, semanal e mensal de compromissos
- **Agendamento de Consultas**: Marcação de horários com profissionais específicos
- **Lembretes Automáticos**: Notificações para profissionais e pacientes
- **Reagendamento e Cancelamento**: Gestão flexível de compromissos

### Monitoramento de Saúde

- **Registro de Sinais Vitais**: Pressão arterial, temperatura, batimentos cardíacos
- **Acompanhamento de Medicamentos**: Registro de administração e doses
- **Evolução do Paciente**: Registro de observações e progressos
- **Gráficos e Tendências**: Visualização da evolução de parâmetros ao longo do tempo

### Comunicação

- **Chat Seguro**: Comunicação direta entre profissionais e pacientes
- **Compartilhamento de Documentos**: Envio de resultados de exames e receitas
- **Notificações Personalizadas**: Alertas para medicamentos, consultas e tarefas
- **Integração com Email**: Envio de resumos e relatórios

### Gestão de Equipes

- **Atribuição de Tarefas**: Distribuição de responsabilidades entre a equipe
- **Histórico de Atividades**: Registro de todas as ações realizadas
- **Permissões Personalizadas**: Controle de acesso por função e nível
- **Colaboração**: Ferramentas para trabalho conjunto em casos complexos

## Arquitetura Técnica

### Estrutura da Aplicação

O aplicativo Kodix Care é construído com:

- **Expo SDK**: Framework para desenvolvimento React Native
- **Expo Router**: Sistema de navegação baseado em arquivo
- **Tamagui**: Biblioteca de componentes UI para React Native
- **TanStack Query**: Gerenciamento de estado e cache de dados
- **tRPC**: Comunicação tipada com o backend
- **Zustand**: Gerenciamento de estado global

### Integração com Backend

O Kodix Care se comunica com o backend principal através de chamadas tRPC, que garantem segurança e tipagem completa:

```typescript
// Exemplo de chamada tRPC em um componente
const { data: pacientes, isLoading } =
  api.app.kodixCare.pacientes.listar.useQuery();
const { mutate: registrarSinalVital } =
  api.app.kodixCare.sinaisVitais.registrar.useMutation();
```

### Armazenamento Local

O aplicativo utiliza diversas estratégias de armazenamento local:

- **AsyncStorage**: Para dados não sensíveis e configurações
- **Secure Store**: Para informações que requerem segurança adicional
- **SQLite**: Para dados que precisam ser consultados offline
- **Cache do TanStack Query**: Para otimização de desempenho

### Sincronização Offline

O Kodix Care implementa uma estratégia de funcionamento offline que permite:

1. **Uso Offline**: Acesso a dados previamente sincronizados
2. **Fila de Operações**: Armazenamento de ações realizadas offline
3. **Sincronização Automática**: Envio de alterações quando a conexão é reestabelecida
4. **Resolução de Conflitos**: Estratégias para resolver inconsistências

## Guia de Implementação

### Adicionando Novos Registros de Saúde

Para implementar um novo tipo de registro de saúde (ex: glicemia):

1. **Banco de Dados**:

   ```typescript
   // Em packages/db/src/schema/apps/kodixCare.ts
   export const registrosGlicemia = mysqlTable("registrosGlicemia", {
     id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
     pacienteId: varchar("pacienteId", { length: 30 })
       .notNull()
       .references(() => pacientes.id, { onDelete: "cascade" }),
     valor: int("valor").notNull(),
     momento: timestamp("momento").defaultNow().notNull(),
     observacoes: text("observacoes"),
     registradoPor: varchar("registradoPor", { length: 30 })
       .notNull()
       .references(() => users.id),
     createdAt: timestamp("createdAt").defaultNow().notNull(),
     updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
   });
   ```

2. **Validadores**:

   ```typescript
   // Em packages/validators/src/app/kodixCare.ts
   export const registroGlicemiaSchema = z.object({
     pacienteId: z.string(),
     valor: z.number().min(20).max(600),
     momento: z.date().optional(),
     observacoes: z.string().optional(),
   });
   ```

3. **API tRPC**:

   ```typescript
   // Em packages/api/src/trpc/routers/app/kodixCare.ts
   export const kodixCareRouter = router({
     // Outros endpoints...

     registrosGlicemia: router({
       registrar: protectedProcedure
         .input(registroGlicemiaSchema)
         .mutation(async ({ ctx, input }) => {
           // Implementar lógica de inserção...
         }),

       listarPorPaciente: protectedProcedure
         .input(z.object({ pacienteId: z.string() }))
         .query(async ({ ctx, input }) => {
           // Implementar lógica de consulta...
         }),
     }),
   });
   ```

4. **Componente de UI**:

   ```typescript
   // Em apps/care-expo/src/components/registros/RegistroGlicemia.tsx
   import React from "react";
   import { View, TextInput } from "react-native";
   import { Button, Text } from "tamagui";
   import { api } from "../../utils/api";

   export function RegistroGlicemia({ pacienteId }) {
     const [valor, setValor] = React.useState("");
     const [observacoes, setObservacoes] = React.useState("");

     const { mutate, isLoading } = api.app.kodixCare.registrosGlicemia.registrar.useMutation({
       onSuccess: () => {
         // Limpar campos e mostrar feedback
       },
     });

     const handleSubmit = () => {
       mutate({
         pacienteId,
         valor: Number(valor),
         observacoes,
       });
     };

     return (
       <View>
         <Text>Valor da Glicemia (mg/dL)</Text>
         <TextInput
           value={valor}
           onChangeText={setValor}
           keyboardType="numeric"
         />

         <Text>Observações</Text>
         <TextInput
           value={observacoes}
           onChangeText={setObservacoes}
           multiline
         />

         <Button onPress={handleSubmit} disabled={isLoading}>
           {isLoading ? "Salvando..." : "Salvar Registro"}
         </Button>
       </View>
     );
   }
   ```

### Customização de Notificações

O sistema de notificações do Kodix Care é altamente personalizável:

1. **Configuração de Tipos de Notificação**:

   ```typescript
   // Em packages/db/src/schema/apps/kodixCare.ts
   export const tiposNotificacaoCare = mysqlTable("tiposNotificacaoCare", {
     id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
     nome: varchar("nome", { length: 255 }).notNull(),
     descricao: text("descricao"),
     ativo: boolean("ativo").default(true).notNull(),
   });

   export const preferenciasNotificacaoUsuario = mysqlTable(
     "preferenciasNotificacaoUsuario",
     {
       id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
       userId: varchar("userId", { length: 30 })
         .notNull()
         .references(() => users.id, { onDelete: "cascade" }),
       tipoNotificacaoId: varchar("tipoNotificacaoId", { length: 30 })
         .notNull()
         .references(() => tiposNotificacaoCare.id, { onDelete: "cascade" }),
       receberEmail: boolean("receberEmail").default(true).notNull(),
       receberPush: boolean("receberPush").default(true).notNull(),
       receberSMS: boolean("receberSMS").default(false).notNull(),
     },
   );
   ```

2. **Implementação de Envio**:
   ```typescript
   // Em packages/api/src/services/notificacoes.ts
   export const NotificacaoService = {
     enviarNotificacao: async ({
       userId,
       tipoNotificacaoId,
       titulo,
       mensagem,
       dados,
     }) => {
       // Verificar preferências do usuário
       // Enviar notificações pelos canais habilitados
     },

     enviarNotificacaoPaciente: async ({
       pacienteId,
       tipoNotificacaoId,
       titulo,
       mensagem,
       dados,
     }) => {
       // Lógica específica para pacientes
     },
   };
   ```

## Fluxos Principais

### Fluxo de Atendimento

1. **Agendamento**:

   - Paciente ou profissional agenda consulta
   - Sistema envia notificação de confirmação
   - Lembretes são programados automaticamente

2. **Check-in**:

   - Paciente confirma presença pelo app ou é registrado pela recepção
   - Histórico e dados do paciente são disponibilizados ao profissional
   - Sala de espera virtual é atualizada

3. **Atendimento**:

   - Profissional registra observações e sinais vitais
   - Prescrições e exames são cadastrados
   - Próximos passos são definidos

4. **Pós-atendimento**:
   - Relatório é gerado e enviado ao paciente
   - Acompanhamento é agendado se necessário
   - Lembretes para medicamentos são configurados

### Fluxo de Monitoramento

1. **Configuração de Parâmetros**:

   - Profissional define parâmetros a serem monitorados
   - Frequência e valores de referência são estabelecidos
   - Alertas são configurados para valores fora da normalidade

2. **Registro de Dados**:

   - Paciente ou cuidador registra medições regularmente
   - Aplicativo apresenta gráficos de tendência
   - Feedback imediato sobre valores registrados

3. **Análise Profissional**:
   - Profissional recebe relatórios periódicos
   - Intervenções são realizadas quando necessário
   - Ajustes no tratamento são documentados

## Configurações Avançadas

### Personalização por Tipo de Atendimento

O Kodix Care pode ser configurado para diferentes especialidades médicas ou tipos de atendimento:

```typescript
// Em packages/db/src/schema/apps/kodixCare.ts
export const especialidadesMedicas = mysqlTable("especialidadesMedicas", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  nome: varchar("nome", { length: 255 }).notNull(),
  camposPersonalizados: json("camposPersonalizados").$type<
    {
      nome: string;
      tipo: "texto" | "numero" | "data" | "selecao";
      opcoes?: string[];
      obrigatorio: boolean;
    }[]
  >(),
});
```

Cada especialidade pode ter formulários e fluxos personalizados, adaptando o aplicativo para diferentes necessidades clínicas.

### Integração com Dispositivos

O Kodix Care suporta integração com dispositivos médicos via:

1. **Bluetooth**: Para dispositivos próximos
2. **API de Saúde**: Integração com Apple Health e Google Fit
3. **Integração com IoT**: Para monitoramento contínuo remoto

## Segurança e Privacidade

O Kodix Care segue rigorosos padrões de segurança para proteção de dados médicos:

1. **Criptografia**: Dados sensíveis são criptografados em trânsito e em repouso
2. **Autenticação Multifator**: Para acesso a informações sensíveis
3. **Registros de Auditoria**: Todas as ações são registradas para fins de auditoria
4. **Controle de Acesso**: Baseado em funções e contexto clínico
5. **Anonimização**: Para relatórios e análises estatísticas

## Próximos Passos e Desenvolvimento

### Roadmap de Funcionalidades

- **Telemedicina**: Integração de consultas por vídeo
- **Inteligência Artificial**: Assistentes para diagnóstico e sugestões
- **Integração com Wearables**: Monitoramento contínuo de parâmetros
- **Interoperabilidade**: Integração com sistemas hospitalares via HL7/FHIR
- **Expansão Mobile**: Aplicativo para pacientes separado do aplicativo para profissionais
