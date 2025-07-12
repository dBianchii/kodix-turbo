#!/usr/bin/env node

/**
 * Script de Diagnóstico - Fluxo Welcome Screen → Chat Session
 *
 * Uso: node scripts/diagnose-chat-flow.js
 *
 * Este script analisa os logs do console para identificar onde o fluxo quebra
 */

console.log("🔍 DIAGNÓSTICO DO FLUXO DO CHAT");
console.log("================================\n");

console.log("📋 CHECKLIST DE VERIFICAÇÃO:\n");

console.log("1. CRIAÇÃO DA SESSÃO:");
console.log("   [ ] Log: '🚀 [FLOW_TRACE] 1. Iniciando criação de sessão'");
console.log("   [ ] Log: '🚀 [FLOW_TRACE] 2. Sessão criada com sucesso'");
console.log("   [ ] Verificar se sessionId foi retornado");
console.log("   [ ] Verificar se message foi criada no backend\n");

console.log("2. NAVEGAÇÃO:");
console.log("   [ ] Log: '🚀 [FLOW_TRACE] 3. Navegando para sessão'");
console.log("   [ ] URL mudou para /chat/{sessionId}");
console.log("   [ ] ActiveChatWindow foi montado\n");

console.log("3. CARREGAMENTO DO ACTIVECHATWINDOW:");
console.log("   [ ] Log: '🚀 [FLOW_TRACE] 4. ActiveChatWindow montado'");
console.log("   [ ] Log: '🚀 [FLOW_TRACE] 5. Detectada nova sessão'");
console.log("   [ ] Verificar isLoadingSession = true → false\n");

console.log("4. SINCRONIZAÇÃO DE MENSAGENS:");
console.log("   [ ] Log: '🚀 [FLOW_TRACE] 6. Mensagens carregadas do banco'");
console.log("   [ ] Verificar count = 1 (primeira mensagem)");
console.log("   [ ] Verificar hasAssistantReply = false");
console.log("   [ ] useChat deve ter messages.length = 1\n");

console.log("5. STREAMING DA RESPOSTA:");
console.log("   [ ] Requisição HTTP para /api/chat/stream");
console.log("   [ ] Status 200 com streaming");
console.log("   [ ] Mensagem do assistente aparece na UI\n");

console.log("⚠️  PONTOS DE FALHA COMUNS:\n");

console.log("❌ Se parou no passo 4:");
console.log("   → useChat não está iniciando streaming automaticamente");
console.log("   → Precisa de trigger manual (handleSubmit ou append)\n");

console.log("❌ Se não há requisição HTTP:");
console.log("   → handleSubmit não está sendo chamado");
console.log("   → input está vazio (useChat requer input)\n");

console.log("❌ Se há duplicação:");
console.log("   → useEffect executando múltiplas vezes");
console.log("   → Falta de guards adequados\n");

console.log("📊 ANÁLISE DOS LOGS:");
console.log("-------------------");
console.log("Cole os logs do browser abaixo para análise detalhada:");
console.log("(Pressione Ctrl+D quando terminar)\n");

// Ler logs do stdin se fornecidos
if (!process.stdin.isTTY) {
  let logs = "";

  process.stdin.on("data", (chunk) => {
    logs += chunk;
  });

  process.stdin.on("end", () => {
    analyzeLogs(logs);
  });
}

function analyzeLogs(logs) {
  const lines = logs.split("\n");
  const flowSteps = {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: false,
  };

  lines.forEach((line) => {
    if (line.includes("[FLOW_TRACE] 1.")) flowSteps.step1 = true;
    if (line.includes("[FLOW_TRACE] 2.")) flowSteps.step2 = true;
    if (line.includes("[FLOW_TRACE] 3.")) flowSteps.step3 = true;
    if (line.includes("[FLOW_TRACE] 4.")) flowSteps.step4 = true;
    if (line.includes("[FLOW_TRACE] 5.")) flowSteps.step5 = true;
    if (line.includes("[FLOW_TRACE] 6.")) flowSteps.step6 = true;
    if (line.includes("[FLOW_TRACE] 7.")) flowSteps.step7 = true;
  });

  console.log("\n🎯 RESULTADO DA ANÁLISE:");
  console.log("------------------------");

  Object.entries(flowSteps).forEach(([step, completed]) => {
    console.log(`${completed ? "✅" : "❌"} ${step.toUpperCase()}`);
  });

  // Identificar onde quebrou
  const failedStep = Object.entries(flowSteps).find(
    ([_, completed]) => !completed,
  );

  if (failedStep) {
    console.log(`\n⚠️  FLUXO QUEBROU NO: ${failedStep[0].toUpperCase()}`);

    switch (failedStep[0]) {
      case "step7":
        console.log("→ Streaming não está sendo iniciado automaticamente");
        console.log(
          "→ Solução: Implementar auto-trigger após carregar mensagens",
        );
        break;
      case "step6":
        console.log("→ Mensagens não estão sendo carregadas do banco");
        console.log("→ Verificar useSessionWithMessages hook");
        break;
      case "step5":
        console.log("→ Refetch não está sendo executado");
        console.log("→ Verificar guards do useEffect");
        break;
    }
  } else {
    console.log("\n✅ TODOS OS PASSOS COMPLETADOS!");
  }
}
