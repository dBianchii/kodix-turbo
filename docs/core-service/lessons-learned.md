# 📖 Lições Aprendidas - Core Service

**Data de Criação:** 2025-07-02  
**Status:** Documento vivo.

## 🎯 Objetivo

Este documento captura lições de implementação específicas do **Core Service**, focando em padrões de código e desafios encontrados ao construir serviços centrais e reutilizáveis.

---

## 📚 Lições de Implementação

### 1. 🧬 Tratamento de `Promise.allSettled` com Tipos Heterogêneos

- **Lição**: A função utilitária `getSuccessesAndErrors` é ideal para `Promise.allSettled` onde todos os resultados têm o **mesmo tipo**. Quando os tipos de retorno são diferentes (heterogêneos), seu uso causa erros de tipo complexos.
- **O Problema**: Ao tentar buscar `user`, `team`, e `userConfig` em um único `Promise.allSettled`, a desestruturação `const [user, team, config] = successes` falhou, pois o TypeScript não conseguiu inferir um tipo comum para o array `successes`.
- **✅ Solução**: Em cenários com tipos de retorno heterogêneos, a abordagem mais segura e explícita é processar o array de resultados manualmente, sem usar `getSuccessesAndErrors`.

  ```typescript
  // Cenário: Buscar dados de fontes diferentes com tipos diferentes.
  const results = await Promise.allSettled([
    db.query.users.findFirst(...),      // Retorna User | undefined
    db.query.teams.findFirst(...),      // Retorna Team | undefined
    db.query.userAppTeamConfigs.findFirst(...), // Retorna Config | undefined
  ]);

  // ✅ Processamento manual e seguro
  const userResult = results[0];
  const teamResult = results[1];
  const configResult = results[2];

  const userName = userResult.status === 'fulfilled' ? userResult.value?.name : 'Default';
  const teamName = teamResult.status === 'fulfilled' ? teamResult.value?.name : 'Default';
  // ... e assim por diante.
  ```

- **Benefício**: Garante a segurança de tipos sem a necessidade de `type assertions` complexas, tornando o código mais legível e robusto ao lidar com múltiplas fontes de dados.
