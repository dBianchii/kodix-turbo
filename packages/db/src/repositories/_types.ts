import type { AnyZodObject, z } from "zod";

export interface Update<T extends AnyZodObject> {
  id: string;
  input: z.infer<T>;
}
export interface UpdateWithTeamId<T extends AnyZodObject> extends Update<T> {
  teamId: string;
}
