import 'dotenv/config';
import mysql from 'mysql2/promise';

async function checkSession() {
  let connection;
  try {
    connection = await mysql.createConnection(process.env.MYSQL_URL);
    
    console.log('🔍 Checking session: oh74p0heie2f');
    
    // Check if session exists
    const [sessions] = await connection.execute(
      'SELECT id, title, aiAgentId, activeAgentId, agentHistory, createdAt FROM chat_session WHERE id = ?',
      ['oh74p0heie2f']
    );
    
    if (sessions.length === 0) {
      console.log('❌ Session not found in database');
      
      // Show some existing sessions for comparison
      console.log('\n📋 Recent sessions in database:');
      const [recentSessions] = await connection.execute(
        'SELECT id, title, aiAgentId, activeAgentId, createdAt FROM chat_session ORDER BY createdAt DESC LIMIT 5'
      );
      
      recentSessions.forEach(s => {
        console.log(`  • ${s.id} - "${s.title}" (agent: ${s.aiAgentId || 'none'})`);
      });
      
    } else {
      const session = sessions[0];
      console.log('✅ Session found:');
      console.log(`   • ID: ${session.id}`);
      console.log(`   • Title: ${session.title}`);
      console.log(`   • AI Agent ID: ${session.aiAgentId || 'none'}`);
      console.log(`   • Active Agent ID: ${session.activeAgentId || 'none'}`);
      console.log(`   • Created: ${session.createdAt}`);
      
      if (session.agentHistory) {
        console.log(`   • Agent History: ${JSON.stringify(session.agentHistory)}`);
      }
      
      // Check messages in this session
      const [messages] = await connection.execute(
        'SELECT senderRole, content, createdAt FROM chat_message WHERE chatSessionId = ? ORDER BY createdAt LIMIT 10',
        ['oh74p0heie2f']
      );
      
      console.log(`\n💬 Messages in session: ${messages.length}`);
      messages.forEach((msg, i) => {
        console.log(`  ${i+1}. [${msg.senderRole}]: ${msg.content.substring(0, 100)}...`);
      });
    }
    
    // Show total sessions count
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM chat_session');
    console.log(`\n📊 Total sessions in database: ${count[0].total}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSession();