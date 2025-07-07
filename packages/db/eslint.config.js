import baseConfig, {
  baseRestrictedImports,
  enforceDrizzleWhere,
  restrictEnvAccess,
  restrictEnvAccessRestrictedImports,
} from "@kdx/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  ...restrictEnvAccess,
  ...enforceDrizzleWhere,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...baseRestrictedImports,
            ...restrictEnvAccessRestrictedImports,
            {
              name: "drizzle-orm/mysql-core",
              importNames: [
                "binary",
                "boolean",
                "char",
                "customType",
                "date",
                "datetime",
                "decimal",
                "double",
                "float",
                "int",
                "json",
                "mediumint",
                "mysqlEnum",
                "real",
                "serial",
                "smallint",
                "text",
                "time",
                "timestamp",
                "tinyint",
                "varbinary",
                "varchar",
                "year",
              ],
              message:
                "Do not import column creators from drizzle directly. Use the table callback approach instead.",
            },
          ],
        },
      ],
    },
  },
];
