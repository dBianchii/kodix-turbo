# 001: Corrigir Resolução de Módulos TypeScript para o Monorepo

- **Status**: Aceito
- **Data**: 2024-07-27

## Contexto

O processo de desenvolvimento estava consistentemente bloqueado por um erro persistente de TypeScript: `Cannot find module '@kdx/...'` (por exemplo, `@kdx/validators/trpc/app`). Este erro ocorria durante o `pnpm typecheck` e impedia o build da aplicação, mesmo após múltiplas tentativas de limpar o cache (`turbo clean`) e reinstalar as dependências (`pnpm install`).

O problema indicava uma falha fundamental na forma como o TypeScript resolvia os caminhos para os pacotes internos no workspace pnpm/Turborepo. A investigação revelou duas causas principais:

1.  O arquivo de configuração base `tooling/typescript/base.json`, que é herdado por todos os projetos, não possuía os aliases de `paths` necessários para mapear os nomes dos pacotes (ex: `@kdx/validators`) para suas localizações no código-fonte.
2.  Alguns `imports` no código estavam utilizando caminhos profundos e específicos da implementação (ex: `.../src/trpc/app/chat`) em vez dos pontos de entrada oficiais definidos no campo `exports` do `package.json` dos pacotes.

## Decisão

Para resolver este problema de forma definitiva e tornar a resolução de módulos explícita e robusta, implementamos uma solução em duas partes:

1.  **Adicionar `paths` ao `tsconfig.json` Base**: Modificamos o arquivo `tooling/typescript/base.json` para incluir um mapeamento de `paths`. Esta configuração diz explicitamente ao compilador TypeScript onde encontrar o código-fonte de cada pacote interno.

    ```json
    "baseUrl": ".",
    "paths": {
      "@kdx/api": ["./packages/api/src"],
      "@kdx/auth": ["./packages/auth/src"],
      "@kdx/db": ["./packages/db/src"],
      "@kdx/locales": ["./packages/locales/src"],
      "@kdx/permissions": ["./packages/permissions/src"],
      "@kdx/shared": ["./packages/shared/src/index.ts"],
      "@kdx/ui/*": ["./packages/ui/src/*"],
      "@kdx/validators": ["./packages/validators/src"]
    }
    ```

2.  **Corrigir `imports` para Respeitar o Campo `exports`**: Corrigimos os `imports` nos arquivos consumidores (ex: `useChatSessionManager.ts`) para que utilizassem os pontos de entrada oficiais dos pacotes, conforme definido no `package.json`, em vez de caminhos profundos.

## Consequências

### Positivas

- **Resolução Completa do Problema**: Os erros persistentes de `typecheck` foram completamente eliminados, desbloqueando o desenvolvimento e os testes.
- **Robustez Arquitetural**: O projeto agora segue as melhores práticas de TypeScript para monorepos, com uma resolução de módulos explícita.
- **Estabilidade do Build**: A previsibilidade e estabilidade do processo de build foram significativamente melhoradas.
- **Prevenção de Erros Futuros**: A probabilidade de problemas similares de resolução de caminhos ocorrerem no futuro foi drasticamente reduzida.

### Negativas

- **Manutenção Mínima**: Requer uma pequena sobrecarga de manutenção. Qualquer novo pacote adicionado ao monorepo precisará ser registrado nos `paths` do `tooling/typescript/base.json` para garantir que seja resolvido corretamente.

Esta decisão, embora tenha modificado um arquivo de configuração central, foi essencial para restaurar um ambiente de desenvolvimento funcional e estabelecer uma base arquitetural mais sólida e confiável.
