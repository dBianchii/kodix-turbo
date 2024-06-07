import { initContract } from "@ts-rest/core";
import { z } from "zod";

import { ZGetConfigInput } from "@kdx/validators/trpc/app";

const c = initContract();

export const contract = c.router(
  {
    app: {
      getConfig: {
        method: "GET",
        path: "/app/getConfig",
        query: ZGetConfigInput,
        responses: {
          401: z.object({
            message: z.string(),
          }),
          404: z.undefined(),
          200: z.object({
            patientName: z.string(),
            clonedCareTasksUntil: z.date().optional(),
          }),
        },
      },
    },
  },
  {
    strictStatusCodes: true,
  },
);
