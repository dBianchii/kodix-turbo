/**
 * ESLint rule para proibir imports incorretos de tRPC no projeto Kodix
 *
 * Proíbe: import { api } from "~/trpc/react"
 * Permite: import { useTRPC } from "~/trpc/react"
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Proíbe imports incorretos de tRPC que não funcionam na arquitetura do Kodix",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      noApiImport:
        "❌ ERRO: 'import { api }' não funciona no Kodix. Use 'import { useTRPC }' em vez disso.",
      noDirectMutation:
        "❌ ERRO: '.useMutation()' direto não funciona. Use 'useMutation(trpc.method.mutationOptions())' em vez disso.",
      noDirectQuery:
        "❌ ERRO: '.useQuery()' direto não funciona. Use 'useQuery(trpc.method.queryOptions())' em vez disso.",
      noApiUtils:
        "❌ ERRO: 'api.useUtils()' não funciona. Use 'useQueryClient()' from '@tanstack/react-query' em vez disso.",
    },
  },

  create(context) {
    return {
      // Verificar imports de { api }
      ImportDeclaration(node) {
        if (
          node.source.value === "~/trpc/react" &&
          node.specifiers.some(
            (spec) =>
              spec.type === "ImportSpecifier" && spec.imported.name === "api",
          )
        ) {
          context.report({
            node,
            messageId: "noApiImport",
            fix(fixer) {
              // Auto-fix: substituir { api } por { useTRPC }
              const sourceCode = context.getSourceCode();
              const importText = sourceCode.getText(node);
              const fixedImport = importText.replace(
                /\{\s*api\s*\}/,
                "{ useTRPC }",
              );
              return fixer.replaceText(node, fixedImport);
            },
          });
        }
      },

      // Verificar uso de .useMutation() direto
      CallExpression(node) {
        if (
          node.type === "CallExpression" &&
          node.callee.type === "MemberExpression" &&
          node.callee.property.name === "useMutation" &&
          node.callee.object.type !== "Identifier" // Não é useMutation(...)
        ) {
          context.report({
            node,
            messageId: "noDirectMutation",
          });
        }

        // Verificar uso de .useQuery() direto
        if (
          node.type === "CallExpression" &&
          node.callee.type === "MemberExpression" &&
          node.callee.property.name === "useQuery" &&
          node.callee.object.type !== "Identifier" // Não é useQuery(...)
        ) {
          context.report({
            node,
            messageId: "noDirectQuery",
          });
        }

        // Verificar uso de api.useUtils()
        if (
          node.type === "CallExpression" &&
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "api" &&
          node.callee.property.name === "useUtils"
        ) {
          context.report({
            node,
            messageId: "noApiUtils",
          });
        }
      },
    };
  },
};
