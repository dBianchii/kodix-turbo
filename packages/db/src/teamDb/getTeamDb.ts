// import type { DBQueryConfig, SQLWrapper } from "drizzle-orm";
// import { and, eq } from "drizzle-orm";

// import type { db as _db } from "../client";
// import type {
//   DbTable,
//   DeleteArgs,
//   DeleteFn,
//   FindArgs,
//   FindFn,
//   FromArgs,
//   FromFn,
//   InsertArgs,
//   JoinArgs,
//   JoinFn,
//   SetArgs,
//   SetFn,
//   Team,
//   TeamDbClient,
//   UpdateArgs,
//   ValuesArgs,
//   ValuesFn,
//   WhereArgs,
//   WhereFn,
// } from "./teamDb.types";
// import { db } from "../client";
// import * as schema from "../schema";

// type AnyArgs = any[];

// interface InvokeContext {
//   path?: string[];
//   fnPath?: { name: string; args: unknown[] }[];
// }

// interface InterceptFn {
//   invoke: (...args: unknown[]) => unknown;
//   name: string;
//   args: unknown[];
// }

// interface OverrideFn {
//   pattern: string | string[];
//   action: () => unknown;
// }

// export const getTeamDb = (team: Team): TeamDbClient => {
//   const teamIdColumn = "teamId";

//   const getTable = (table: DbTable) => schema[table];

//   const getAccessPolicy = (
//     table: {
//       [teamIdColumn]: any;
//     },
//     owner: Team,
//   ) => eq(table[teamIdColumn], owner.id);

//   const intercept = (fn: InterceptFn, context: InvokeContext = {}) => {
//     const { path = [], fnPath = [] } = context;

//     const pathAsString = path.join(".");

//     const matchPath = (pattern: string) => {
//       return new RegExp(
//         `^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`,
//       ).test(pathAsString);
//     };

//     const overrides: OverrideFn[] = [
//       {
//         pattern: "db.transaction",
//         action: () => {
//           const transactionFn = fn.invoke as typeof db.transaction;
//           const [callback] = fn.args as Parameters<typeof db.transaction>;

//           return transactionFn(async (tx) => {
//             const wrappedTx = createProxy(tx, { path: ["tx"] });
//             return callback(wrappedTx);
//           });
//         },
//       },
//       {
//         pattern: ["db.execute", "db.*.execute", "tx.execute", "tx.*.execute"],
//         action: () => {
//           throw new Error("'execute' in teamDB is not allowed");
//         },
//       },
//       {
//         pattern: [
//           "db.query.findMany",
//           "db.query.*.findMany",
//           "db.query.findFirst",
//           "db.query.*.findFirst",
//           "tx.query.findMany",
//           "tx.query.*.findMany",
//           "tx.query.findFirst",
//           "tx.query.*.findFirst",
//         ],
//         action: () => {
//           const findFn = fn.invoke as FindFn;
//           const findArgs = fn.args as FindArgs;

//           const tableIndex = path.findIndex((x) => x === "query") + 1;
//           const tableName = path[tableIndex]! as keyof typeof db.query;
//           const table = getTable(tableName as DbTable);

//           if (teamIdColumn in table) {
//             let [config] = findArgs;

//             if (config?.where) {
//               config = {
//                 ...config,
//                 where: and(
//                   getAccessPolicy(table, team),
//                   config.where as SQLWrapper,
//                 ),
//               };
//             }

//             if (!config?.where) {
//               config = {
//                 ...config,
//                 where: getAccessPolicy(table, team),
//               };
//             }

//             if (config.with) {
//               config = {
//                 ...config,
//                 with: (
//                   Object.keys(config.with) as (keyof typeof config.with)[]
//                 ).reduce<DBQueryConfig["with"]>((acc, key) => {
//                   const value = config!.with![key] as
//                     | true
//                     | null
//                     | DBQueryConfig<"many">;

//                   if (value === true) {
//                     return {
//                       ...acc,
//                       [key]: {
//                         where: (table) =>
//                           teamIdColumn in table
//                             ? // @ts-expect-error: typescript aint easy
//                               getAccessPolicy(table, team)
//                             : undefined,
//                       },
//                     };
//                   }

//                   if (typeof value === "object" && value !== null) {
//                     return {
//                       ...acc,
//                       [key]: {
//                         ...value,
//                         where: (table, other) =>
//                           teamIdColumn in table
//                             ? and(
//                                 // @ts-expect-error: typescript aint easy
//                                 getAccessPolicy(table, team),
//                                 typeof value.where === "function"
//                                   ? value.where(table, other)
//                                   : value.where,
//                               )
//                             : typeof value.where === "function"
//                               ? value.where(table, other)
//                               : value.where,
//                       },
//                     };
//                   }

//                   return { ...acc, [key]: value };

//                 }, config.with as any),
//               };
//             }

//             return findFn(...([config] as FindArgs));
//           }

//           return findFn(...findArgs);
//         },
//       },
//       {
//         pattern: ["db.*.from", "tx.*.from"],
//         action: () => {
//           const fromFn = fn.invoke as FromFn;
//           const fromArgs = fn.args as FromArgs;

//           const [table] = fromArgs;

//           if (teamIdColumn in table) {
//             return fromFn(...fromArgs).where(getAccessPolicy(table, team));
//           }

//           return fromFn(...fromArgs);
//         },
//       },
//       {
//         pattern: [
//           "db.*.from.where",
//           "db.*.from.*.where",
//           "tx.*.from.where",
//           "tx.*.from.*.where",
//         ],
//         action: () => {
//           const whereFn = fn.invoke as WhereFn;
//           const whereArgs = fn.args as WhereArgs;

//           // @ts-expect-error: typescript aint easy
//           const [table] = fnPath.findLast((x) => x.name === "from")
//             ?.args as FromArgs;

//           if (teamIdColumn in table) {
//             const [whereFilter] = whereArgs;

//             return whereFn(
//               and(getAccessPolicy(table, team), whereFilter as SQLWrapper),
//             );
//           }

//           return whereFn(...whereArgs);
//         },
//       },
//       {
//         pattern: [
//           "db.*.leftJoin",
//           "db.*.rightJoin",
//           "db.*.innerJoin",
//           "db.*.fullJoin",
//           "tx.*.leftJoin",
//           "tx.*.rightJoin",
//           "tx.*.innerJoin",
//           "tx.*.fullJoin",
//         ],
//         action: () => {
//           const joinFn = fn.invoke as JoinFn;
//           const joinArgs = fn.args as JoinArgs;

//           const [table, joinOptions] = joinArgs;

//           if (teamIdColumn in table) {
//             return joinFn(
//               table,
//               and(getAccessPolicy(table, team), joinOptions as SQLWrapper),
//             );
//           }

//           return joinFn(...joinArgs);
//         },
//       },
//       {
//         pattern: ["db.insert.values", "tx.insert.values"],
//         action: () => {
//           const valuesFn = fn.invoke as ValuesFn;
//           const valuesArgs = fn.args as ValuesArgs;

//           // @ts-expect-error: typescript aint easy
//           const [table] = fnPath.findLast((x) => x.name === "insert")
//             ?.args as InsertArgs;

//           if (teamIdColumn in table) {
//             let [valuesToInsert] = valuesArgs;

//             if (!Array.isArray(valuesToInsert)) {
//               valuesToInsert = [valuesToInsert];
//             }

//             const valuesToInsertWithOwner = valuesToInsert.map((value) => ({
//               ...value,
//               ownerId: team.id,
//             }));

//             return valuesFn(valuesToInsertWithOwner);
//           }

//           return valuesFn(...valuesArgs);
//         },
//       },
//       {
//         pattern: ["db.update.set", "tx.update.set"],
//         action: () => {
//           const setFn = fn.invoke as SetFn;
//           const setArgs = fn.args as SetArgs;

//           // @ts-expect-error: typescript aint easy
//           const [table] = fnPath.findLast((x) => x.name === "update")
//             ?.args as UpdateArgs;

//           if (teamIdColumn in table) {
//             return setFn(...setArgs).where(getAccessPolicy(table, team));
//           }

//           return setFn(...setArgs);
//         },
//       },
//       {
//         pattern: [
//           "db.update.where",
//           "db.update.*.where",
//           "tx.update.where",
//           "tx.update.*.where",
//         ],
//         action: () => {
//           const whereFn = fn.invoke as WhereFn;
//           const whereArgs = fn.args as WhereArgs;

//           const [table] = [...fnPath].reverse().find((x) => x.name === "update")
//             ?.args as UpdateArgs;

//           if (teamIdColumn in table) {
//             const [whereFilter] = whereArgs;

//             return whereFn(
//               and(getAccessPolicy(table, team), whereFilter as SQLWrapper),
//             );
//           }

//           return whereFn(...whereArgs);
//         },
//       },
//       {
//         pattern: ["db.delete", "tx.delete"],
//         action: () => {
//           const deleteFn = fn.invoke as DeleteFn;
//           const deleteArgs = fn.args as DeleteArgs;

//           const [table] = deleteArgs;

//           if (teamIdColumn in table) {
//             return deleteFn(...deleteArgs).where(getAccessPolicy(table, team));
//           }

//           return deleteFn(...deleteArgs);
//         },
//       },
//       {
//         pattern: [
//           "db.delete.where",
//           "db.delete.*.where",
//           "tx.delete.where",
//           "tx.delete.*.where",
//         ],
//         action: () => {
//           const whereFn = fn.invoke as WhereFn;
//           const whereArgs = fn.args as WhereArgs;

//           // @ts-expect-error: typescript aint easy
//           const [table] = fnPath.findLast((x) => x.name === "delete")
//             ?.args as DeleteArgs;

//           if (teamIdColumn in table) {
//             const [whereOptions] = whereArgs;

//             return whereFn(
//               and(getAccessPolicy(table, team), whereOptions as SQLWrapper),
//             );
//           }

//           return whereFn(...whereArgs);
//         },
//       },
//     ];

//     const fnOverride = overrides.find(({ pattern, action }) => {
//       if (Array.isArray(pattern) && pattern.some(matchPath)) {
//         return action;
//       }

//       if (typeof pattern === "string" && matchPath(pattern)) {
//         return action;
//       }

//       return null;
//     })?.action;

//     return fnOverride ? fnOverride() : fn.invoke(...fn.args);
//   };

//   const createProxy = <T extends object>(
//     target: T,
//     context: InvokeContext = {},
//   ): T => {
//     const { path = [], fnPath = [] } = context;

//     return new Proxy<T>(target, {
//       get: (innerTarget, innerTargetProp, innerTargetReceiver) => {
//         const currentPath = path.concat(innerTargetProp.toString());
//         const innerTargetPropValue = Reflect.get(
//           innerTarget,
//           innerTargetProp,
//           innerTargetReceiver,
//         );

//         if (typeof innerTargetPropValue === "function") {
//           return (...args: AnyArgs) => {
//             const currentFnPath = [
//               ...fnPath,
//               { name: innerTargetProp.toString(), args },
//             ];

//             const result = intercept(
//               {
//                 invoke: innerTargetPropValue.bind(
//                   innerTarget,
//                 ) as InterceptFn["invoke"],
//                 name: innerTargetProp.toString(),
//                 args,
//               },
//               { path: currentPath, fnPath: currentFnPath },
//             );

//             if (
//               typeof result === "object" &&
//               result !== null &&
//               !Array.isArray(result)
//             ) {
//               return createProxy(result, {
//                 path: currentPath,
//                 fnPath: currentFnPath,
//               });
//             }

//             return result;
//           };
//         } else if (
//           typeof innerTargetPropValue === "object" &&
//           innerTargetPropValue !== null &&
//           !Array.isArray(innerTargetPropValue)
//         ) {
//           // wrap nested objects in a proxy as well
//           return createProxy(innerTargetPropValue, {
//             path: currentPath,
//             fnPath,
//           });
//         }

//         return innerTargetPropValue;
//       },
//     });
//   };

//   return createProxy(db, { path: ["db"] });
// };
