#!/usr/bin/env node

/**
 * Script simples para verificar se Chat e AI Studio estão instalados
 * Usa a API do próprio projeto
 */

const BASE_URL = "http://localhost:3000";

async function checkAppsInstalled() {
  try {
    console.log("🔍 VERIFICANDO APPS INSTALADOS");
    console.log("=============================");

    // Fazer request para a API tRPC para verificar apps instalados
    // Vou tentar usar o endpoint público primeiro

    const apiUrl = `${BASE_URL}/api/trpc/app.getAll`;
    console.log(`📡 Fazendo request para: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Status da resposta: ${response.status}`);

    if (!response.ok) {
      console.log("❌ Não foi possível acessar a API diretamente");
      console.log("⚠️  Isso pode ser normal se requer autenticação");

      console.log("\n🔄 PRÓXIMOS PASSOS MANUAIS:");
      console.log("1. Abrir http://localhost:3000/apps");
      console.log("2. Verificar se Chat e AI Studio estão instalados");
      console.log("3. Se não estiverem, clicar em 'Instalar' para cada um");
      console.log("4. Ir para AI Studio e configurar pelo menos um modelo");
      console.log("5. Testar criar novo chat novamente");
      return;
    }

    const data = await response.json();
    console.log("✅ API acessível!");

    const apps = data?.result?.data?.json || [];
    console.log(`\n📋 Total de apps encontrados: ${apps.length}`);

    // Procurar especificamente por Chat e AI Studio (IDs corretos do shared)
    const chatApp = apps.find((app) => app.id === "az1x2c3bv4n5");
    const aiStudioApp = apps.find((app) => app.id === "ai9x7m2k5p1s");

    console.log("\n🔍 STATUS DOS APPS CRÍTICOS:");
    console.log("==============================");

    console.log(`📱 Chat App:`);
    if (chatApp) {
      console.log(`   ✅ Encontrado: ${chatApp.name}`);
      console.log(
        `   📊 Instalado: ${chatApp.installed ? "✅ SIM" : "❌ NÃO"}`,
      );
    } else {
      console.log(`   ❌ Chat app não encontrado na lista`);
    }

    console.log(`\n🤖 AI Studio App:`);
    if (aiStudioApp) {
      console.log(`   ✅ Encontrado: ${aiStudioApp.name}`);
      console.log(
        `   📊 Instalado: ${aiStudioApp.installed ? "✅ SIM" : "❌ NÃO"}`,
      );
    } else {
      console.log(`   ❌ AI Studio app não encontrado na lista`);
    }

    // Mostrar todos os apps para debug
    console.log("\n📋 TODOS OS APPS DISPONÍVEIS:");
    console.log("=============================");
    apps.forEach((app) => {
      const status = app.installed ? "✅" : "❌";
      console.log(
        `${status} ${app.name} (${app.id}) - Instalado: ${app.installed}`,
      );
    });

    // Análise e recomendações
    console.log("\n🎯 ANÁLISE:");
    console.log("===========");

    const chatInstalled = chatApp?.installed;
    const aiStudioInstalled = aiStudioApp?.installed;

    if (!chatInstalled) {
      console.log("🚨 PROBLEMA ENCONTRADO: Chat não está instalado!");
      console.log(
        "   💡 Solução: Ir para http://localhost:3000/apps e instalar o Chat",
      );
    }

    if (!aiStudioInstalled) {
      console.log("🚨 PROBLEMA ENCONTRADO: AI Studio não está instalado!");
      console.log(
        "   💡 Solução: Ir para http://localhost:3000/apps e instalar o AI Studio",
      );
      console.log("   ⚠️  Chat depende do AI Studio para funcionar");
    }

    if (chatInstalled && aiStudioInstalled) {
      console.log("✅ Chat e AI Studio estão instalados!");
      console.log(
        "🔄 Próximo passo: Verificar se há modelos configurados no AI Studio",
      );
      console.log("   1. Ir para http://localhost:3000/apps/ai-studio");
      console.log("   2. Configurar pelo menos um modelo de IA");
      console.log("   3. Ativar o modelo");
      console.log("   4. Testar chat novamente");
    } else {
      console.log("\n🔄 AÇÕES NECESSÁRIAS:");
      console.log("=====================");
      console.log("1. Ir para http://localhost:3000/apps");
      if (!aiStudioInstalled) console.log("2. Instalar AI Studio primeiro");
      if (!chatInstalled) console.log("3. Instalar Chat");
      console.log("4. Configurar modelos no AI Studio");
      console.log("5. Testar chat novamente");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar apps:", error.message);

    console.log("\n🔄 PRÓXIMOS PASSOS MANUAIS:");
    console.log("1. Verificar se o servidor está rodando: pnpm dev:kdx");
    console.log("2. Abrir http://localhost:3000/apps");
    console.log("3. Verificar se Chat e AI Studio estão instalados");
    console.log("4. Se não estiverem, clicar em 'Instalar' para cada um");
    console.log("5. Ir para AI Studio e configurar pelo menos um modelo");
    console.log("6. Testar criar novo chat novamente");
  }
}

// Executar verificação
checkAppsInstalled();
