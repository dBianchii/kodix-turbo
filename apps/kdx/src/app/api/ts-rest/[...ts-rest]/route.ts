import { createNextHandler } from "@ts-rest/serverless/next";

import { contract, tsRestRouter } from "@kdx/api";

const handler = createNextHandler(contract, tsRestRouter, {
  basePath: "/api/app-router",
  jsonQuery: true,
  responseValidation: true,
  handlerType: "app-router",
});

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
