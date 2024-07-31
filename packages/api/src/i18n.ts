// /* eslint-disable */
// import { notFound } from "next/navigation";

// import { getRequestConfig } from "@kdx/locales/next-intl";

// const locales = ["pt-BR", "en"];

// export default getRequestConfig(async ({ locale }) => {
//   // Validate that the incoming `locale` parameter is valid
//   if (!locales.includes(locale as any)) notFound();

//   return {
//     messages: (await import(`../../locales/src/messages/${locale}.json`))
//       .default as Record<string, string>,
//   };
// });

//TODO: remove this file probably
