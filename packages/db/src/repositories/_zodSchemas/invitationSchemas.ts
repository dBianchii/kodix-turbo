import { invitationSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zInvitationUpdate = invitationSchema
  .omit({ id: true })
  .deepPartial();
export const zInvitationCreate = invitationSchema;
export const zInvitationCreateMany = zInvitationCreate.array();
