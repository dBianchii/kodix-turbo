/**
 * 🧪 TESTES - SISTEMA DE MÉTRICAS VERCEL AI SDK
 *
 * Testes completos para validar funcionamento do sistema
 * de monitoramento e observabilidade.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";

import type { ChatMetrics } from "./vercel-ai-metrics";
import { VercelAIMetrics } from "./vercel-ai-metrics";

describe("VercelAIMetrics", () => {
  beforeEach(() => {
    // Limpar métricas antes de cada teste
    VercelAIMetrics.clearOldMetrics(0);
  });

  describe("recordChatInteraction", () => {
    test("should record successful interaction", () => {
      const metrics: ChatMetrics = {
        timestamp: new Date(),
        sessionId: "test-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 1500,
        totalChunks: 50,
        throughput: 33.33,
        tokensUsed: 1000,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 3,
        temperature: 0.7,
        maxTokens: 4000,
      };

      VercelAIMetrics.recordChatInteraction(metrics);

      const summary = VercelAIMetrics.getMetricsSummary("hour");
      expect(summary.totalRequests).toBe(1);
      expect(summary.successRate).toBe(100);
      expect(summary.avgResponseTime).toBe(1500);
    });

    test("should record failed interaction", () => {
      const metrics: ChatMetrics = {
        timestamp: new Date(),
        sessionId: "test-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 5000,
        totalChunks: 0,
        throughput: 0,
        tokensUsed: 0,
        success: false,
        errorType: "TimeoutError",
        errorMessage: "Request timeout",
        provider: "vercel-ai-sdk",
        fallbackUsed: true,
        messageCount: 2,
      };

      VercelAIMetrics.recordChatInteraction(metrics);

      const summary = VercelAIMetrics.getMetricsSummary("hour");
      expect(summary.totalRequests).toBe(1);
      expect(summary.successRate).toBe(0);
      expect(summary.errorBreakdown.TimeoutError).toBe(1);
    });

    test("should calculate throughput automatically", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const metrics: ChatMetrics = {
        timestamp: new Date(),
        sessionId: "test-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 2000, // 2 segundos
        totalChunks: 100,
        throughput: 0, // Não fornecido
        tokensUsed: 1500,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 1,
      };

      VercelAIMetrics.recordChatInteraction(metrics);

      const detailed = VercelAIMetrics.getDetailedMetrics({
        sessionId: "test-session",
      });
      expect(detailed[0]?.throughput).toBe(50); // 100 chunks / 2000ms * 1000 = 50 chunks/segundo
    });
  });

  describe("getMetricsSummary", () => {
    test("should return empty summary when no metrics", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const summary = VercelAIMetrics.getMetricsSummary("hour");

      expect(summary.totalRequests).toBe(0);
      expect(summary.successRate).toBe(0);
      expect(summary.avgResponseTime).toBe(0);
      expect(summary.avgThroughput).toBe(0);
    });

    test("should calculate correct averages", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      // Adicionar 3 métricas com valores diferentes
      const metrics = [
        {
          timestamp: new Date(),
          sessionId: "session-1",
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 1000,
          totalChunks: 20,
          throughput: 20,
          tokensUsed: 500,
          success: true,
          provider: "vercel-ai-sdk" as const,
          fallbackUsed: false,
          messageCount: 1,
        },
        {
          timestamp: new Date(),
          sessionId: "session-2",
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 2000,
          totalChunks: 40,
          throughput: 20,
          tokensUsed: 1000,
          success: true,
          provider: "vercel-ai-sdk" as const,
          fallbackUsed: false,
          messageCount: 2,
        },
        {
          timestamp: new Date(),
          sessionId: "session-3",
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 3000,
          totalChunks: 60,
          throughput: 20,
          tokensUsed: 1500,
          success: true,
          provider: "vercel-ai-sdk" as const,
          fallbackUsed: false,
          messageCount: 3,
        },
      ];

      metrics.forEach((metric) =>
        VercelAIMetrics.recordChatInteraction(metric),
      );

      const summary = VercelAIMetrics.getMetricsSummary("hour");

      expect(summary.totalRequests).toBe(3);
      expect(summary.successRate).toBe(100);
      expect(summary.avgResponseTime).toBe(2000); // (1000 + 2000 + 3000) / 3
      expect(summary.avgThroughput).toBe(20); // Todos têm throughput 20
      expect(summary.totalTokens).toBe(3000); // 500 + 1000 + 1500
    });

    test("should filter by timeframe correctly", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Métrica antiga (2 horas atrás)
      VercelAIMetrics.recordChatInteraction({
        timestamp: twoHoursAgo,
        sessionId: "old-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 1000,
        totalChunks: 10,
        throughput: 10,
        tokensUsed: 500,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 1,
      });

      // Métrica recente
      VercelAIMetrics.recordChatInteraction({
        timestamp: now,
        sessionId: "recent-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 2000,
        totalChunks: 20,
        throughput: 10,
        tokensUsed: 1000,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 1,
      });

      const hourSummary = VercelAIMetrics.getMetricsSummary("hour");
      const daySummary = VercelAIMetrics.getMetricsSummary("day");

      expect(hourSummary.totalRequests).toBe(1); // Apenas a recente
      expect(daySummary.totalRequests).toBe(2); // Ambas
    });
  });

  describe("getDetailedMetrics", () => {
    test("should filter by sessionId", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const metrics = [
        {
          timestamp: new Date(),
          sessionId: "session-1",
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 1000,
          totalChunks: 10,
          throughput: 10,
          tokensUsed: 500,
          success: true,
          provider: "vercel-ai-sdk" as const,
          fallbackUsed: false,
          messageCount: 1,
        },
        {
          timestamp: new Date(),
          sessionId: "session-2",
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 2000,
          totalChunks: 20,
          throughput: 10,
          tokensUsed: 1000,
          success: true,
          provider: "vercel-ai-sdk" as const,
          fallbackUsed: false,
          messageCount: 1,
        },
      ];

      metrics.forEach((metric) =>
        VercelAIMetrics.recordChatInteraction(metric),
      );

      const filtered = VercelAIMetrics.getDetailedMetrics({
        sessionId: "session-1",
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.sessionId).toBe("session-1");
    });

    test("should filter by success status", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const successMetric: ChatMetrics = {
        timestamp: new Date(),
        sessionId: "success-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 1000,
        totalChunks: 10,
        throughput: 10,
        tokensUsed: 500,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 1,
      };

      const failureMetric: ChatMetrics = {
        timestamp: new Date(),
        sessionId: "failure-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 5000,
        totalChunks: 0,
        throughput: 0,
        tokensUsed: 0,
        success: false,
        errorType: "NetworkError",
        provider: "vercel-ai-sdk",
        fallbackUsed: true,
        messageCount: 1,
      };

      VercelAIMetrics.recordChatInteraction(successMetric);
      VercelAIMetrics.recordChatInteraction(failureMetric);

      const successOnly = VercelAIMetrics.getDetailedMetrics({ success: true });
      const failuresOnly = VercelAIMetrics.getDetailedMetrics({
        success: false,
      });

      expect(successOnly).toHaveLength(1);
      expect(successOnly[0]?.success).toBe(true);

      expect(failuresOnly).toHaveLength(1);
      expect(failuresOnly[0]?.success).toBe(false);
    });
  });

  describe("getHealthStatus", () => {
    test("should return healthy status for good metrics", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      // Adicionar métricas boas
      for (let i = 0; i < 10; i++) {
        VercelAIMetrics.recordChatInteraction({
          timestamp: new Date(),
          sessionId: `session-${i}`,
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 2000, // Tempo bom (menor que 5000ms)
          totalChunks: 30,
          throughput: 15, // Throughput bom (maior que 5)
          tokensUsed: 1000,
          success: true, // Todas com sucesso
          provider: "vercel-ai-sdk",
          fallbackUsed: false,
          messageCount: 2,
        });
      }

      const health = VercelAIMetrics.getHealthStatus();

      expect(health.status).toBe("healthy");
      expect(health.details.successRate).toBe(100);
      expect(health.details.avgResponseTime).toBe(2000);
      expect(health.recommendations).toContain(
        "Sistema funcionando normalmente",
      );
    });

    test("should return critical status for poor metrics", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      // Adicionar métricas ruins
      for (let i = 0; i < 10; i++) {
        VercelAIMetrics.recordChatInteraction({
          timestamp: new Date(),
          sessionId: `session-${i}`,
          modelId: "gpt-4",
          teamId: "test-team",
          responseTime: 8000, // Tempo alto
          totalChunks: 0,
          throughput: 0,
          tokensUsed: 0,
          success: i < 8, // 80% de sucesso (abaixo de 90%)
          errorType: i >= 8 ? "TimeoutError" : undefined,
          provider: "vercel-ai-sdk",
          fallbackUsed: i >= 8,
          messageCount: 1,
        });
      }

      const health = VercelAIMetrics.getHealthStatus();

      expect(health.status).toBe("critical");
      expect(health.details.successRate).toBe(80);
      expect(health.recommendations.length).toBeGreaterThan(1);
    });
  });

  describe("clearOldMetrics", () => {
    test("should remove old metrics", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const now = new Date();
      const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 horas atrás

      // Adicionar métrica antiga
      VercelAIMetrics.recordChatInteraction({
        timestamp: yesterday,
        sessionId: "old-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 1000,
        totalChunks: 10,
        throughput: 10,
        tokensUsed: 500,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 1,
      });

      // Adicionar métrica recente
      VercelAIMetrics.recordChatInteraction({
        timestamp: now,
        sessionId: "recent-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 2000,
        totalChunks: 20,
        throughput: 10,
        tokensUsed: 1000,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 1,
      });

      // Verificar que temos 2 métricas
      const allMetrics = VercelAIMetrics.getDetailedMetrics();
      expect(allMetrics).toHaveLength(2);

      // Limpar métricas antigas (24 horas)
      const removedCount = VercelAIMetrics.clearOldMetrics(24);

      expect(removedCount).toBe(1);

      // Verificar que sobrou apenas 1 métrica
      const remainingMetrics = VercelAIMetrics.getDetailedMetrics();
      expect(remainingMetrics).toHaveLength(1);
      expect(remainingMetrics[0]?.sessionId).toBe("recent-session");
    });
  });

  describe("console logging", () => {
    test("should log successful interactions", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      VercelAIMetrics.recordChatInteraction({
        timestamp: new Date(),
        sessionId: "test-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 1500,
        totalChunks: 30,
        throughput: 20,
        tokensUsed: 1000,
        success: true,
        provider: "vercel-ai-sdk",
        fallbackUsed: false,
        messageCount: 2,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("📊 [METRICS] Chat interaction successful"),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    test("should log failed interactions", () => {
      // Resetar completamente as métricas
      VercelAIMetrics.resetMetrics();

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      VercelAIMetrics.recordChatInteraction({
        timestamp: new Date(),
        sessionId: "test-session",
        modelId: "gpt-4",
        teamId: "test-team",
        responseTime: 5000,
        totalChunks: 0,
        throughput: 0,
        tokensUsed: 0,
        success: false,
        errorType: "NetworkError",
        errorMessage: "Connection failed",
        provider: "vercel-ai-sdk",
        fallbackUsed: true,
        messageCount: 1,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("📊 [METRICS] Chat interaction failed"),
        expect.any(Object),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
