/**
 * 🚨 SISTEMA DE ALERTAS - VERCEL AI SDK
 *
 * Sistema inteligente de alertas para detectar problemas
 * automaticamente e fornecer recomendações de ação.
 *
 * Subetapa 5: Monitoramento e Observabilidade
 */

import type { MetricsSummary } from "./vercel-ai-metrics";
import { VercelAIMetrics } from "./vercel-ai-metrics";

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
  recommendations: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (summary: MetricsSummary) => boolean;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  recommendations: string[];
  cooldownMinutes: number; // Evitar spam de alertas
}

export class AlertSystem {
  private static alerts: Alert[] = [];
  private static lastAlertTime = new Map<string, Date>();
  private static monitoringInterval?: NodeJS.Timeout;

  // 📋 Regras de alerta pré-configuradas
  private static readonly ALERT_RULES: AlertRule[] = [
    {
      id: "low-success-rate-critical",
      name: "Taxa de Sucesso Crítica",
      condition: (summary) =>
        summary.successRate < 90 && summary.totalRequests > 5,
      severity: "critical",
      title: "Taxa de Sucesso Crítica",
      message: "Taxa de sucesso abaixo de 90%",
      recommendations: [
        "Verificar logs de erro para identificar causa raiz",
        "Considerar desabilitar Vercel AI SDK temporariamente",
        "Verificar status dos provedores de IA",
        "Analisar métricas detalhadas por modelo",
      ],
      cooldownMinutes: 5,
    },
    {
      id: "low-success-rate-warning",
      name: "Taxa de Sucesso em Atenção",
      condition: (summary) =>
        summary.successRate < 95 &&
        summary.successRate >= 90 &&
        summary.totalRequests > 5,
      severity: "warning",
      title: "Taxa de Sucesso em Atenção",
      message: "Taxa de sucesso entre 90-95%",
      recommendations: [
        "Monitorar tendência da taxa de sucesso",
        "Verificar logs para padrões de erro",
        "Considerar ajustar timeouts ou parâmetros",
      ],
      cooldownMinutes: 10,
    },
    {
      id: "high-response-time-critical",
      name: "Tempo de Resposta Crítico",
      condition: (summary) =>
        summary.avgResponseTime > 10000 && summary.totalRequests > 3,
      severity: "critical",
      title: "Tempo de Resposta Crítico",
      message: "Tempo médio de resposta acima de 10s",
      recommendations: [
        "Verificar latência da rede",
        "Analisar modelos sendo utilizados",
        "Considerar reduzir maxTokens",
        "Verificar carga dos provedores",
      ],
      cooldownMinutes: 5,
    },
    {
      id: "high-response-time-warning",
      name: "Tempo de Resposta Alto",
      condition: (summary) =>
        summary.avgResponseTime > 5000 &&
        summary.avgResponseTime <= 10000 &&
        summary.totalRequests > 3,
      severity: "warning",
      title: "Tempo de Resposta Alto",
      message: "Tempo médio de resposta entre 5-10s",
      recommendations: [
        "Monitorar tendência do tempo de resposta",
        "Verificar performance por modelo",
        "Considerar otimizações de parâmetros",
      ],
      cooldownMinutes: 15,
    },
    {
      id: "high-error-volume",
      name: "Alto Volume de Erros",
      condition: (summary) => {
        const errorCount =
          summary.totalRequests -
          (summary.totalRequests * summary.successRate) / 100;
        return errorCount > 10 && summary.totalRequests > 15;
      },
      severity: "warning",
      title: "Alto Volume de Erros",
      message: "Mais de 10 erros detectados na última hora",
      recommendations: [
        "Analisar tipos de erro mais comuns",
        "Verificar configuração de modelos",
        "Validar tokens de API",
        "Considerar implementar retry logic",
      ],
      cooldownMinutes: 10,
    },
    {
      id: "low-throughput",
      name: "Throughput Baixo",
      condition: (summary) =>
        summary.avgThroughput < 5 && summary.totalRequests > 5,
      severity: "warning",
      title: "Throughput Baixo",
      message: "Throughput médio abaixo de 5 chunks/segundo",
      recommendations: [
        "Verificar latência da rede",
        "Analisar modelos com baixo throughput",
        "Considerar otimizar parâmetros de streaming",
      ],
      cooldownMinutes: 20,
    },
    {
      id: "high-token-usage",
      name: "Alto Uso de Tokens",
      condition: (summary) => summary.totalTokens > 100000,
      severity: "info",
      title: "Alto Uso de Tokens",
      message: "Mais de 100k tokens usados na última hora",
      recommendations: [
        "Monitorar custos de API",
        "Verificar se uso está dentro do esperado",
        "Considerar implementar limites por usuário",
      ],
      cooldownMinutes: 60,
    },
  ];

  /**
   * 🔍 Verificar métricas e disparar alertas
   */
  static checkHealthMetrics(): void {
    try {
      const summary = VercelAIMetrics.getMetricsSummary("hour");

      console.log(`🔍 [ALERTS] Checking health metrics`, {
        totalRequests: summary.totalRequests,
        successRate: summary.successRate.toFixed(1),
        avgResponseTime: summary.avgResponseTime.toFixed(0),
        avgThroughput: summary.avgThroughput.toFixed(1),
      });

      // Verificar cada regra de alerta
      for (const rule of this.ALERT_RULES) {
        this.evaluateRule(rule, summary);
      }

      // Limpar alertas antigos
      this.cleanupOldAlerts();
    } catch (error) {
      console.error(`🔴 [ALERTS] Error checking health metrics:`, error);
    }
  }

  /**
   * 📊 Avaliar uma regra de alerta específica
   */
  private static evaluateRule(rule: AlertRule, summary: MetricsSummary): void {
    try {
      // Verificar se a condição é atendida
      if (!rule.condition(summary)) {
        return;
      }

      // Verificar cooldown para evitar spam
      const lastAlert = this.lastAlertTime.get(rule.id);
      const now = new Date();

      if (lastAlert) {
        const timeSinceLastAlert = now.getTime() - lastAlert.getTime();
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;

        if (timeSinceLastAlert < cooldownMs) {
          return; // Ainda em cooldown
        }
      }

      // Criar novo alerta
      const alert: Alert = {
        id: `${rule.id}-${now.getTime()}`,
        severity: rule.severity,
        title: rule.title,
        message: `${rule.message} (${this.formatMetricContext(summary)})`,
        timestamp: now,
        resolved: false,
        recommendations: rule.recommendations,
        metadata: {
          ruleId: rule.id,
          summary: {
            totalRequests: summary.totalRequests,
            successRate: summary.successRate,
            avgResponseTime: summary.avgResponseTime,
            avgThroughput: summary.avgThroughput,
          },
        },
      };

      // Armazenar alerta
      this.alerts.push(alert);
      this.lastAlertTime.set(rule.id, now);

      // Log do alerta
      this.logAlert(alert);
    } catch (error) {
      console.error(`🔴 [ALERTS] Error evaluating rule ${rule.id}:`, error);
    }
  }

  /**
   * 📝 Log estruturado do alerta
   */
  private static logAlert(alert: Alert): void {
    const logMethod =
      alert.severity === "critical"
        ? console.error
        : alert.severity === "warning"
          ? console.warn
          : console.info;

    const emoji =
      alert.severity === "critical"
        ? "🚨"
        : alert.severity === "warning"
          ? "⚠️"
          : "ℹ️";

    logMethod(`${emoji} [ALERT] ${alert.title}`, {
      id: alert.id,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp.toISOString(),
      recommendations: alert.recommendations,
      metadata: alert.metadata,
    });
  }

  /**
   * 📈 Formatar contexto das métricas para mensagem
   */
  private static formatMetricContext(summary: MetricsSummary): string {
    const parts = [];

    if (summary.totalRequests > 0) {
      parts.push(`${summary.totalRequests} requests`);
    }

    if (summary.successRate < 100) {
      parts.push(`${summary.successRate.toFixed(1)}% success`);
    }

    if (summary.avgResponseTime > 1000) {
      parts.push(`${(summary.avgResponseTime / 1000).toFixed(1)}s avg`);
    }

    return parts.join(", ");
  }

  /**
   * 🧹 Limpar alertas antigos
   */
  private static cleanupOldAlerts(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
    const initialCount = this.alerts.length;

    this.alerts = this.alerts.filter((alert) => alert.timestamp >= cutoff);

    const removedCount = initialCount - this.alerts.length;
    if (removedCount > 0) {
      console.log(`🧹 [ALERTS] Cleaned ${removedCount} old alerts`);
    }
  }

  /**
   * 🚀 Iniciar monitoramento automático
   */
  static startMonitoring(intervalMinutes = 5): void {
    if (this.monitoringInterval) {
      console.warn(`⚠️ [ALERTS] Monitoring already started`);
      return;
    }

    console.log(
      `🚀 [ALERTS] Starting health monitoring (every ${intervalMinutes} minutes)`,
    );

    // Verificação inicial
    this.checkHealthMetrics();

    // Verificação periódica
    this.monitoringInterval = setInterval(
      () => {
        this.checkHealthMetrics();
      },
      intervalMinutes * 60 * 1000,
    );
  }

  /**
   * 🛑 Parar monitoramento automático
   */
  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log(`🛑 [ALERTS] Health monitoring stopped`);
    }
  }

  /**
   * 📋 Obter alertas ativos
   */
  static getActiveAlerts(): Alert[] {
    return this.alerts
      .filter((alert) => !alert.resolved)
      .sort((a, b) => {
        // Ordenar por severidade (critical > warning > info) e depois por timestamp
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        const severityDiff =
          severityOrder[b.severity] - severityOrder[a.severity];

        if (severityDiff !== 0) {
          return severityDiff;
        }

        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  }

  /**
   * 📊 Obter resumo de alertas
   */
  static getAlertsSummary(): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<string, number>;
    recent: Alert[];
  } {
    const activeAlerts = this.alerts.filter((alert) => !alert.resolved);
    const resolvedAlerts = this.alerts.filter((alert) => alert.resolved);

    const bySeverity = this.alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Últimos 10 alertas
    const recent = [...this.alerts]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      total: this.alerts.length,
      active: activeAlerts.length,
      resolved: resolvedAlerts.length,
      bySeverity,
      recent,
    };
  }

  /**
   * ✅ Resolver um alerta
   */
  static resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);

    if (!alert) {
      return false;
    }

    if (alert.resolved) {
      return true; // Já resolvido
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();

    if (resolvedBy) {
      alert.metadata = {
        ...alert.metadata,
        resolvedBy,
      };
    }

    console.log(`✅ [ALERTS] Alert resolved: ${alert.id}`, {
      title: alert.title,
      resolvedBy: resolvedBy || "system",
      resolvedAt: alert.resolvedAt.toISOString(),
    });

    return true;
  }

  /**
   * 🧪 Testar sistema de alertas (para desenvolvimento)
   */
  static testAlerts(): void {
    console.log(`🧪 [ALERTS] Running alert system test...`);

    // Simular métricas ruins para testar alertas
    const testSummary: MetricsSummary = {
      timeframe: "hour",
      totalRequests: 20,
      successRate: 85, // Baixa taxa de sucesso
      avgResponseTime: 12000, // Alto tempo de resposta
      avgThroughput: 3, // Baixo throughput
      totalTokens: 150000, // Alto uso de tokens
      errorBreakdown: { TimeoutError: 3 },
      providerBreakdown: { "vercel-ai-sdk": 20 },
      modelBreakdown: { "gpt-4": 20 },
      slowRequests: 15,
      fastRequests: 2,
    };

    // Avaliar todas as regras com métricas de teste
    for (const rule of this.ALERT_RULES) {
      this.evaluateRule(rule, testSummary);
    }

    console.log(
      `🧪 [ALERTS] Test completed. Generated ${this.getActiveAlerts().length} test alerts`,
    );
  }
}
