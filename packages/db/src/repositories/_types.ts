import type { AnyZodObject, z } from "zod";

export interface Update<T extends AnyZodObject> {
  id: string;
  input: z.infer<T>;
}
