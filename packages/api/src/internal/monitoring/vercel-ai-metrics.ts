/**
 * 📊 SISTEMA DE MÉTRICAS - VERCEL AI SDK
 *
 * Sistema completo de monitoramento para rastrear performance,
 * confiabilidade e uso do Vercel AI SDK em produção.
 *
 * Subetapa 5: Monitoramento e Observabilidade
 */

export interface ChatMetrics {
  // Identificação
  timestamp: Date;
  sessionId: string;
  modelId: string;
  teamId: string;
  userId?: string;

  // Performance
  responseTime: number; // ms
  firstChunkTime?: number; // ms até primeiro chunk
  totalChunks: number;
  throughput: number; // chunks/segundo

  // Uso
  tokensUsed: number;
  inputTokens?: number;
  outputTokens?: number;

  // Qualidade
  success: boolean;
  errorType?: string;
  errorMessage?: string;
  finishReason?: string;

  // Sistema
  provider: "vercel-ai-sdk" | "current-system";
  actualModel?: string; // Modelo real usado
  fallbackUsed: boolean;

  // Contexto
  messageCount: number;
  temperature?: number;
  maxTokens?: number;
}

export interface MetricsSummary {
  timeframe: "hour" | "day" | "week";
  totalRequests: number;
  successRate: number; // 0-100
  avgResponseTime: number; // ms
  avgThroughput: number; // chunks/segundo
  totalTokens: number;
  errorBreakdown: Record<string, number>;
  providerBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
  slowRequests: number; // > 5s
  fastRequests: number; // < 2s
}

export class VercelAIMetrics {
  private static metrics: ChatMetrics[] = [];
  private static readonly MAX_METRICS = 10000; // Limite para não consumir muita memória

  /**
   * 📊 Registrar uma interação de chat
   */
  static recordChatInteraction(metrics: ChatMetrics): void {
    // Adicionar timestamp se não fornecido
    if (!metrics.timestamp) {
      metrics.timestamp = new Date();
    }

    // Calcular throughput se não fornecido
    if (
      !metrics.throughput &&
      metrics.responseTime > 0 &&
      metrics.totalChunks > 0
    ) {
      metrics.throughput = (metrics.totalChunks / metrics.responseTime) * 1000; // chunks/segundo
    }

    // Armazenar métrica
    this.metrics.push(metrics);

    // Limpar métricas antigas se necessário
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log estruturado para observabilidade
    this.logMetrics(metrics);

    // Alertas automáticos
    this.checkAlerts(metrics);
  }

  /**
   * 📝 Log estruturado das métricas
   */
  private static logMetrics(metrics: ChatMetrics): void {
    const logData = {
      sessionId: metrics.sessionId,
      modelId: metrics.modelId,
      teamId: metrics.teamId,
      responseTime: metrics.responseTime,
      totalChunks: metrics.totalChunks,
      throughput: Math.round(metrics.throughput * 100) / 100,
      success: metrics.success,
      provider: metrics.provider,
      tokensUsed: metrics.tokensUsed,
      timestamp: metrics.timestamp.toISOString(),
    };

    if (metrics.success) {
      console.log(`📊 [METRICS] Chat interaction successful`, logData);
    } else {
      console.error(`📊 [METRICS] Chat interaction failed`, {
        ...logData,
        errorType: metrics.errorType,
        errorMessage: metrics.errorMessage,
      });
    }
  }

  /**
   * 🚨 Verificar alertas automáticos
   */
  private static checkAlerts(metrics: ChatMetrics): void {
    // Alerta para resposta lenta
    if (metrics.responseTime > 5000) {
      console.warn(`🚨 [ALERT] Slow response detected`, {
        sessionId: metrics.sessionId,
        responseTime: metrics.responseTime,
        modelId: metrics.modelId,
        provider: metrics.provider,
      });
    }

    // Alerta para falha
    if (!metrics.success) {
      console.error(`🔴 [ALERT] Chat interaction failed`, {
        sessionId: metrics.sessionId,
        errorType: metrics.errorType,
        errorMessage: metrics.errorMessage,
        modelId: metrics.modelId,
        provider: metrics.provider,
      });
    }

    // Alerta para throughput baixo
    if (metrics.success && metrics.throughput < 10) {
      // < 10 chunks/segundo
      console.warn(`⚠️ [ALERT] Low throughput detected`, {
        sessionId: metrics.sessionId,
        throughput: metrics.throughput,
        totalChunks: metrics.totalChunks,
        responseTime: metrics.responseTime,
      });
    }

    // Alerta para uso alto de tokens
    if (metrics.tokensUsed > 8000) {
      console.warn(`💰 [ALERT] High token usage`, {
        sessionId: metrics.sessionId,
        tokensUsed: metrics.tokensUsed,
        modelId: metrics.modelId,
      });
    }
  }

  /**
   * 📈 Obter resumo das métricas
   */
  static getMetricsSummary(
    timeframe: "hour" | "day" | "week" = "hour",
  ): MetricsSummary {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.getTimeframeMs(timeframe));

    const recentMetrics = this.metrics.filter((m) => m.timestamp >= cutoff);

    if (recentMetrics.length === 0) {
      return this.getEmptySummary(timeframe);
    }

    const successfulMetrics = recentMetrics.filter((m) => m.success);
    const failedMetrics = recentMetrics.filter((m) => !m.success);

    return {
      timeframe,
      totalRequests: recentMetrics.length,
      successRate: (successfulMetrics.length / recentMetrics.length) * 100,
      avgResponseTime: this.calculateAverage(
        recentMetrics.map((m) => m.responseTime),
      ),
      avgThroughput: this.calculateAverage(
        successfulMetrics.map((m) => m.throughput),
      ),
      totalTokens: recentMetrics.reduce((sum, m) => sum + m.tokensUsed, 0),
      errorBreakdown: this.groupBy(failedMetrics, "errorType"),
      providerBreakdown: this.groupBy(recentMetrics, "provider"),
      modelBreakdown: this.groupBy(recentMetrics, "modelId"),
      slowRequests: recentMetrics.filter((m) => m.responseTime > 5000).length,
      fastRequests: recentMetrics.filter((m) => m.responseTime < 2000).length,
    };
  }

  /**
   * 🔍 Obter métricas detalhadas para debugging
   */
  static getDetailedMetrics(filters?: {
    sessionId?: string;
    teamId?: string;
    modelId?: string;
    provider?: string;
    success?: boolean;
    timeframe?: "hour" | "day" | "week";
  }): ChatMetrics[] {
    let filteredMetrics = [...this.metrics];

    if (filters?.timeframe) {
      const cutoff = new Date(
        Date.now() - this.getTimeframeMs(filters.timeframe),
      );
      filteredMetrics = filteredMetrics.filter((m) => m.timestamp >= cutoff);
    }

    if (filters?.sessionId) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.sessionId === filters.sessionId,
      );
    }

    if (filters?.teamId) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.teamId === filters.teamId,
      );
    }

    if (filters?.modelId) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.modelId === filters.modelId,
      );
    }

    if (filters?.provider) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.provider === filters.provider,
      );
    }

    if (filters?.success !== undefined) {
      filteredMetrics = filteredMetrics.filter(
        (m) => m.success === filters.success,
      );
    }

    return filteredMetrics.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  /**
   * 🧹 Limpar métricas antigas
   */
  static clearOldMetrics(olderThanHours = 24): number {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialCount = this.metrics.length;

    this.metrics = this.metrics.filter((m) => m.timestamp >= cutoff);

    const removedCount = initialCount - this.metrics.length;

    if (removedCount > 0) {
      console.log(
        `🧹 [METRICS] Cleaned ${removedCount} old metrics (older than ${olderThanHours}h)`,
      );
    }

    return removedCount;
  }

  /**
   * 🔄 Resetar todas as métricas (apenas para testes)
   */
  static resetMetrics(): void {
    this.metrics = [];
  }

  /**
   * 📊 Obter status de saúde do sistema
   */
  static getHealthStatus(): {
    status: "healthy" | "warning" | "critical";
    details: {
      successRate: number;
      avgResponseTime: number;
      recentErrors: number;
      totalRequests: number;
    };
    recommendations: string[];
  } {
    const summary = this.getMetricsSummary("hour");
    const recommendations: string[] = [];

    let status: "healthy" | "warning" | "critical" = "healthy";

    // Verificar taxa de sucesso
    if (summary.successRate < 90) {
      status = "critical";
      recommendations.push(
        `Taxa de sucesso baixa: ${summary.successRate.toFixed(1)}%`,
      );
    } else if (summary.successRate < 95) {
      status = "warning";
      recommendations.push(
        `Taxa de sucesso em atenção: ${summary.successRate.toFixed(1)}%`,
      );
    }

    // Verificar tempo de resposta
    if (summary.avgResponseTime > 5000) {
      status = status === "critical" ? "critical" : "warning";
      recommendations.push(
        `Tempo de resposta alto: ${summary.avgResponseTime.toFixed(0)}ms`,
      );
    }

    // Verificar volume de erros
    const recentErrors =
      summary.totalRequests -
      (summary.totalRequests * summary.successRate) / 100;
    if (recentErrors > 10) {
      status = status === "critical" ? "critical" : "warning";
      recommendations.push(`Muitos erros recentes: ${recentErrors}`);
    }

    if (recommendations.length === 0) {
      recommendations.push("Sistema funcionando normalmente");
    }

    return {
      status,
      details: {
        successRate: summary.successRate,
        avgResponseTime: summary.avgResponseTime,
        recentErrors,
        totalRequests: summary.totalRequests,
      },
      recommendations,
    };
  }

  // Métodos auxiliares privados

  private static getTimeframeMs(timeframe: "hour" | "day" | "week"): number {
    switch (timeframe) {
      case "hour":
        return 60 * 60 * 1000;
      case "day":
        return 24 * 60 * 60 * 1000;
      case "week":
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private static getEmptySummary(
    timeframe: "hour" | "day" | "week",
  ): MetricsSummary {
    return {
      timeframe,
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      avgThroughput: 0,
      totalTokens: 0,
      errorBreakdown: {},
      providerBreakdown: {},
      modelBreakdown: {},
      slowRequests: 0,
      fastRequests: 0,
    };
  }

  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private static groupBy<T extends Record<string, any>>(
    items: T[],
    key: keyof T,
  ): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const value = String(item[key] || "unknown");
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
