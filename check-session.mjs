import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { chatSession, chatMessage } from './packages/db/src/schema/apps/chat.ts';
import { eq } from 'drizzle-orm';

const pool = createPool(process.env.MYSQL_URL);
const db = drizzle(pool);

async function checkSession() {
  try {
    console.log('🔍 Checking session: oh74p0heie2f');
    
    // Check if session exists
    const session = await db
      .select()
      .from(chatSession)
      .where(eq(chatSession.id, 'oh74p0heie2f'))
      .limit(1);
    
    if (session.length === 0) {
      console.log('❌ Session not found in database');
      
      // Show some existing sessions for comparison
      console.log('\n📋 Recent sessions in database:');
      const recentSessions = await db
        .select({
          id: chatSession.id,
          title: chatSession.title,
          aiAgentId: chatSession.aiAgentId,
          activeAgentId: chatSession.activeAgentId,
          agentHistory: chatSession.agentHistory,
          createdAt: chatSession.createdAt
        })
        .from(chatSession)
        .orderBy(chatSession.createdAt)
        .limit(5);
      
      recentSessions.forEach(s => {
        console.log(`  • ${s.id} - "${s.title}" (agent: ${s.aiAgentId || 'none'})`);
      });
      
    } else {
      console.log('✅ Session found:', session[0]);
      
      // Check messages in this session
      const messages = await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.chatSessionId, 'oh74p0heie2f'))
        .limit(10);
      
      console.log(`\n💬 Messages in session: ${messages.length}`);
      messages.forEach((msg, i) => {
        console.log(`  ${i+1}. [${msg.senderRole}]: ${msg.content.substring(0, 100)}...`);
      });
      
      // Check agent switching history
      if (session[0].agentHistory) {
        console.log('\n🔄 Agent History:', session[0].agentHistory);
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSession();