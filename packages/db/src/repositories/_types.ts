import type { ZodObject, z } from "zod/v4";

export interface Update<T extends ZodObject> {
  id: string;
  input: z.infer<T>;
}
export interface UpdateWithTeamId<T extends ZodObject> extends Update<T> {
  teamId: string;
}
