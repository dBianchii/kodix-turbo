import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'kodix'
});

async function investigateSession() {
  try {
    console.log('🔍 Investigando sessão nu8dhbx54zuo...\n');
    
    // Primeiro vamos listar as tabelas disponíveis
    console.log('📋 TABELAS DISPONÍVEIS:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      console.log('- ', Object.values(table)[0]);
    });
    console.log('');
    
    // 1. Buscar dados da sessão (usando nome correto da tabela)
    console.log('📋 DADOS DA SESSÃO:');
    const [sessionRows] = await connection.execute(
      `SELECT id, title, aiAgentId, activeAgentId, aiModelId, agentHistory, createdAt, updatedAt 
       FROM chat_session 
       WHERE id = ?`, 
      ['nu8dhbx54zuo']
    );
    
    if (sessionRows.length === 0) {
      console.log('❌ Sessão não encontrada!');
      return;
    }
    
    const session = sessionRows[0];
    console.log('- ID:', session.id);
    console.log('- Título:', session.title);
    console.log('- aiAgentId:', session.aiAgentId);
    console.log('- activeAgentId:', session.activeAgentId);
    console.log('- aiModelId:', session.aiModelId);
    console.log('- Histórico de agentes (raw):', session.agentHistory || 'Nenhum');
    console.log('- Criado em:', session.createdAt);
    console.log('- Atualizado em:', session.updatedAt);
    console.log('');
    
    // 2. Buscar dados do agente atual
    if (session.aiAgentId) {
      console.log('🤖 DADOS DO AGENTE ATUAL:');
      const [agentRows] = await connection.execute(
        `SELECT id, name, instructions, createdAt, updatedAt 
         FROM ai_agent 
         WHERE id = ?`, 
        [session.aiAgentId]
      );
      
      if (agentRows.length > 0) {
        const agent = agentRows[0];
        console.log('- ID:', agent.id);
        console.log('- Nome:', agent.name);
        console.log('- Instruções (primeiros 200 chars):', agent.instructions?.substring(0, 200) + '...');
        console.log('- Tamanho das instruções:', agent.instructions?.length || 0, 'caracteres');
        console.log('- Criado em:', agent.createdAt);
        console.log('- Atualizado em:', agent.updatedAt);
      } else {
        console.log('❌ Agente não encontrado!');
      }
    } else {
      console.log('⚠️ Nenhum agente definido na sessão');
    }
    console.log('');
    
    // 2.1. Buscar dados do modelo atual
    if (session.aiModelId) {
      console.log('🤖 DADOS DO MODELO ATUAL:');
      // First, let's see what columns are available
      const [modelColumns] = await connection.execute('DESCRIBE ai_model');
      console.log('📋 COLUNAS DISPONÍVEIS na ai_model:');
      modelColumns.forEach(col => {
        console.log('- ', col.Field, ':', col.Type);
      });
      console.log('');
      
      const [modelRows] = await connection.execute(
        `SELECT m.*, p.name as providerName
         FROM ai_model m
         LEFT JOIN ai_provider p ON m.providerId = p.id
         WHERE m.id = ?`, 
        [session.aiModelId]
      );
      
      if (modelRows.length > 0) {
        const model = modelRows[0];
        console.log('- ID:', model.id);
        console.log('- Nome:', model.displayName || 'N/A');
        console.log('- Provider:', model.providerName || 'N/A');
        console.log('- All model data:', JSON.stringify(model, null, 2));
      } else {
        console.log('❌ Modelo não encontrado!');
      }
    } else {
      console.log('⚠️ Nenhum modelo definido na sessão');
    }
    console.log('');
    
    // 3. Buscar todos os agentes disponíveis para comparação
    console.log('🤖 TODOS OS AGENTES DISPONÍVEIS:');
    const [allAgentsRows] = await connection.execute(
      `SELECT id, name, CHAR_LENGTH(instructions) as instructions_length, createdAt 
       FROM ai_agent 
       ORDER BY name`
    );
    
    allAgentsRows.forEach(agent => {
      const isActive = agent.id === session.aiAgentId ? ' ← ATUAL' : '';
      console.log(`- ${agent.name} (ID: ${agent.id}, ${agent.instructions_length} chars)${isActive}`);
    });
    console.log('');
    
    // 4. Buscar mensagens recentes da sessão
    console.log('💬 ÚLTIMAS 15 MENSAGENS DA SESSÃO:');
    const [messageRows] = await connection.execute(
      `SELECT senderRole, content, createdAt 
       FROM chat_message 
       WHERE chatSessionId = ? 
       ORDER BY createdAt DESC 
       LIMIT 15`, 
      ['nu8dhbx54zuo']
    );
    
    messageRows.reverse().forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.senderRole}] ${msg.content.substring(0, 200)}... (${msg.createdAt})`);
    });
    
    if (messageRows.length === 0) {
      console.log('⚠️ Nenhuma mensagem encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

investigateSession();