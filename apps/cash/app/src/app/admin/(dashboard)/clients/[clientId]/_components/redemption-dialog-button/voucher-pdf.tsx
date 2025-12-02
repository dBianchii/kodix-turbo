import type { clients, vouchers } from "@cash/db/schema";
import { formatCurrency, formatDate } from "@kodix/shared/intl-utils";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatVoucherCode } from "~/utils/voucher-utils";

const styles = StyleSheet.create({
  amountLabel: {
    color: "#166534",
    fontSize: 14,
    marginBottom: 8,
  },
  amountSection: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    marginBottom: 24,
    padding: 20,
    textAlign: "center",
  },
  amountValue: {
    color: "#22c55e",
    fontSize: 32,
    fontWeight: "bold",
  },
  clientInfo: {
    color: "#4b5563",
    fontSize: 12,
    marginBottom: 4,
  },
  clientSection: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
  },
  codeLabel: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 8,
  },
  codeSection: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 24,
    padding: 24,
    textAlign: "center",
  },
  codeValue: {
    color: "#111827",
    fontFamily: "Courier",
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  footer: {
    borderTop: "1px solid #e5e7eb",
    bottom: 40,
    left: 40,
    paddingTop: 20,
    position: "absolute",
    right: 40,
    textAlign: "center",
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 10,
    marginBottom: 4,
  },
  header: {
    borderBottom: "2px solid #22c55e",
    marginBottom: 30,
    paddingBottom: 20,
    textAlign: "center",
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 12,
  },
  infoRow: {
    borderBottom: "1px solid #e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "bold",
  },
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    padding: 40,
  },
  sectionTitle: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 12,
  },
  title: {
    color: "#22c55e",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  validityBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    marginTop: 16,
    padding: 8,
  },
  validityText: {
    color: "#92400e",
    fontSize: 10,
    textAlign: "center",
  },
});

export interface VoucherPdfData {
  voucher: Pick<
    typeof vouchers.$inferSelect,
    "codeNumber" | "purchaseTotal" | "createdAt"
  > & {
    amount: number;
  };
  client?: Pick<typeof clients.$inferSelect, "name" | "document" | "phone">;
}

export function VoucherPdfDocument({ data }: { data: VoucherPdfData }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VALE-COMPRA</Text>
          <Text style={styles.subtitle}>Documento de Resgate de Cashback</Text>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>CÓDIGO DO VOUCHER</Text>
          <Text style={styles.codeValue}>
            {formatVoucherCode(data.voucher.codeNumber)}
          </Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>VALOR DO DESCONTO</Text>
          <Text style={styles.amountValue}>
            {formatCurrency("BRL", data.voucher.amount)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor da Compra</Text>
            <Text style={styles.infoValue}>
              {formatCurrency("BRL", data.voucher.purchaseTotal)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Desconto Aplicado</Text>
            <Text style={styles.infoValue}>
              {formatCurrency("BRL", data.voucher.amount)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor Final</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(
                "BRL",
                data.voucher.purchaseTotal - data.voucher.amount,
              )}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Emissão</Text>
            <Text style={styles.infoValue}>
              {formatDate(data.voucher.createdAt)}
            </Text>
          </View>
        </View>

        {(data.client?.name || data.client?.document || data.client?.phone) && (
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            {data.client?.name && (
              <Text style={styles.clientInfo}>Nome: {data.client.name}</Text>
            )}
            {data.client?.document && (
              <Text style={styles.clientInfo}>CPF: {data.client.document}</Text>
            )}
            {data.client?.phone && (
              <Text style={styles.clientInfo}>
                Telefone: {data.client.phone}
              </Text>
            )}
          </View>
        )}

        <View style={styles.validityBadge}>
          <Text style={styles.validityText}>
            Este vale-compra é válido apenas para uso único e não é transferível
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Apresente este documento no momento da compra
          </Text>
          <Text style={styles.footerText}>
            Em caso de dúvidas, entre em contato com a loja
          </Text>
        </View>
      </Page>
    </Document>
  );
}
