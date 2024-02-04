import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";

export const name = "dayjs";

dayjs.extend(utc);
dayjs.extend(isToday);

export type Dayjs = dayjs.Dayjs;

export type { ConfigType } from "dayjs";

export default dayjs;
