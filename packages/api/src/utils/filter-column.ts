import type { Column, ColumnBaseConfig, ColumnDataType } from "@kdx/db";
import type { DataTableConfig } from "@kdx/shared";
import { eq, inArray, isNotNull, isNull, like, not, notLike } from "@kdx/db";

export function filterColumn({
  column,
  value,
  isSelectable,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>;
  value: string;
  isSelectable?: boolean;
}) {
  const [filterValue, filterOperator] = (value.split("~").filter(Boolean) ??
    []) as [
    string,
    DataTableConfig["comparisonOperators"][number]["value"] | undefined,
  ];

  if (!filterValue) return;

  if (isSelectable) {
    switch (filterOperator) {
      case "like":
        return like(column, `%${filterValue}%`);
      case "eq":
        return inArray(column, filterValue.split(".").filter(Boolean) ?? []);
      case "notEq":
        return not(
          inArray(column, filterValue.split(".").filter(Boolean) ?? []),
        );
      case "isNull":
        return isNull(column);
      case "isNotNull":
        return isNotNull(column);
      default:
        return inArray(column, filterValue.split(".") ?? []);
    }
  }

  switch (filterOperator) {
    case "like":
      return like(column, `%${filterValue}%`);
    case "notIlike":
      return notLike(column, `%${filterValue}%`);
    case "startsWith":
      return like(column, `${filterValue}%`);
    case "endsWith":
      return like(column, `%${filterValue}`);
    case "eq":
      return eq(column, filterValue);
    case "notEq":
      return not(eq(column, filterValue));
    case "isNull":
      return isNull(column);
    case "isNotNull":
      return isNotNull(column);
    default:
      return like(column, `%${filterValue}%`);
  }
}
