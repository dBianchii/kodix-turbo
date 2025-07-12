import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";

export const name = "dayjs";

dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export type Dayjs = dayjs.Dayjs;

export type { ConfigType } from "dayjs";

export { ptBR };
export default dayjs;
