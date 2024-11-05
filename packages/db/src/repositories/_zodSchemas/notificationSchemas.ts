import { notificationSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zNotificationUpdate = notificationSchema
  .omit({ id: true })
  .deepPartial();
export const zNotificationCreate = notificationSchema;
