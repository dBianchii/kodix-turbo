import { notificationSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zNotificationUpdate = notificationSchema
  .omit({ id: true })
  .partial();
export const zNotificationCreate = notificationSchema;
export const zNotificationCreateMany = zNotificationCreate.array();
