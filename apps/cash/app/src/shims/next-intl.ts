export const useTranslations = () => (text: string) => text;

export const useFormatter = () => ({
  dateTime: (date: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", options).format(date),
});
