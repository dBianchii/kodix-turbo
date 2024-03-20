//? This file is used to create common values that can be used in the schema files.
import { customType } from "drizzle-orm/mysql-core";

export const DEFAULTLENGTH = 255;

export const moneyDecimal = customType<{ data: number }>({
  dataType: () => "decimal(15,2)",
  fromDriver: (value) => Number(value), //Remember that JavaScript number is a 64-bit floating point value
});
