import { z } from "zod";

export const careTaskSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
  ]),
  z.literal("CareTask"),
]);

export type CareTaskSubject = z.infer<typeof careTaskSubject>;
