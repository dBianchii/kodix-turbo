export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));

export const formatCurrency = (currency: string, value: number) =>
  new Intl.NumberFormat(undefined, {
    currency,
    style: "currency",
  }).format(value);
