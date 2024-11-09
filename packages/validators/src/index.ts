import { z } from "zod";

export const NANOID_REGEX = /^[0-9a-z]{12}$/;
export const ZNanoId = z
  .string()
  .regex(NANOID_REGEX, { message: "Not a valid id" }); //If this is changed, the NANOID_SIZE in @kdx/shared must be updated
