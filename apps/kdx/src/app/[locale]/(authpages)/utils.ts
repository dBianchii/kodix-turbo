import { env } from "~/env";

export const renderDiscord = env.NODE_ENV === "development";
