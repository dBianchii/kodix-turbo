export const useTranslations = () => {
  return (text: string) => text;
};

export const useFormatter = () => {
  return {
    dateTime: (date: Date, options: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat("pt-BR", options).format(date);
    },
  };
};
