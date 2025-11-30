export function formatVoucherCode(codeNumber: number): string {
  return `VC-${codeNumber.toString().padStart(4, "0")}`;
}
