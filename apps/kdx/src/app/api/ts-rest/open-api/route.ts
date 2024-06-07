import { generateOpenApi } from "@ts-rest/open-api";

import { contract } from "@kdx/api";

const openApiDocument = generateOpenApi(contract, {
  info: {
    title: "Posts API",
    version: "1.0.0",
  },
});

export function GET() {
  return new Response(JSON.stringify(openApiDocument), {
    headers: {
      "Content-Type": "text/json",
    },
  });
}
