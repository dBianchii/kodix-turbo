//TODO: Understand where to move this file. Its a file that needs to be shared between the api and the ...
//TODO: Also, I dont think @kdx/api should have an icon lib installed

//TODO: i18n

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  comparisonOperators: [
    { label: "Contains", value: "like" as const },
    { label: "Does not contain", value: "notIlike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "notEq" as const },
    { label: "Starts with", value: "startsWith" as const },
    { label: "Ends with", value: "endsWith" as const },
    { label: "Is empty", value: "isNull" as const },
    { label: "Is not empty", value: "isNotNull" as const },
  ],
  logicalOperators: [
    {
      description: "All conditions must be met",
      label: "And",
      value: "and" as const,
    },
    {
      description: "At least one condition must be met",
      label: "Or",
      value: "or" as const,
    },
  ],
  selectableOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "notEq" as const },
    { label: "Is empty", value: "isNull" as const },
    { label: "Is not empty", value: "isNotNull" as const },
  ],
};
