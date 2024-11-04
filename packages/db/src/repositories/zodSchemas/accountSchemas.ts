import { accountSchema } from "../../schema";

const zAccount = accountSchema.required();

const zAccountMutable = zAccount.deepPartial();
const zAccountRequired = zAccount.pick({
  providerId: true,
  providerUserId: true,
  userId: true,
});

// * ----- Exports live below this line ----- *//
export const zAccountCreate = zAccountMutable.merge(zAccountRequired);
