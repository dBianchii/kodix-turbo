import { initClient } from "@ts-rest/core";

import { kodixCareAppId } from "@kdx/shared";

import { contract } from "./contract";

// const client = initClient(contract, {
//   baseUrl: "http://localhost:3000",
//   baseHeaders: {},
// });

const result = client.app.getConfig({
  query: {
    appId: kodixCareAppId,
  },
  fetchOptions: {},
});
