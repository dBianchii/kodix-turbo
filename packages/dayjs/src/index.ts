import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export const name = "dayjs";

dayjs.extend(utc);

export type Dayjs = dayjs.Dayjs;

export type { ConfigType } from "dayjs";

export default dayjs;
