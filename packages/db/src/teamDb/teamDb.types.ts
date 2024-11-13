import type { db } from "../client";
import type * as schema from "../schema";

export interface Team {
  ids: string[];
}

export type DbSchema = typeof schema;
export type DbTable = keyof DbSchema;

type TransactionFnInnerFn = Parameters<typeof db.transaction>[0];

type TransactionFnInnerFnFirstArg = Parameters<TransactionFnInnerFn>[0];
type TransactionFnInnerFnSecondArgs = Parameters<TransactionFnInnerFn>[1];

export type TeamDbClient = Omit<Omit<typeof db, "execute">, "transaction"> & {
  teamIds: string[];
  transaction: (
    fn: (
      tx: TransactionFnInnerFnFirstArg & { teamIds: string[] },
      config?: TransactionFnInnerFnSecondArgs,
    ) => ReturnType<Parameters<typeof db.transaction>[0]>,
  ) => ReturnType<typeof db.transaction>;
};

export type FindFn<K extends keyof typeof db.query = keyof typeof db.query> = (
  ...args:
    | Parameters<(typeof db.query)[K]["findFirst"]>
    | Parameters<(typeof db.query)[K]["findMany"]>
) =>
  | ReturnType<(typeof db.query)[K]["findFirst"]>
  | ReturnType<(typeof db.query)[K]["findMany"]>;

export type FindArgs<K extends keyof typeof db.query = keyof typeof db.query> =
  Parameters<FindFn<K>>;

export type SelectFn = typeof db.select;

export type SelectArgs = Parameters<SelectFn>;

export type FromFn = ReturnType<SelectFn>["from"];

export type FromArgs = Parameters<FromFn>;

export type WhereFn = ReturnType<FromFn>["where"];

export type WhereArgs = Parameters<WhereFn>;

export type JoinFn = ReturnType<FromFn>["leftJoin"];

export type JoinArgs = Parameters<JoinFn>;

export type InsertFn = typeof db.insert;

export type InsertArgs = Parameters<InsertFn>;

export type ValuesFn = ReturnType<InsertFn>["values"];

export type ValuesArgs = Parameters<ValuesFn>;

export type UpdateFn = typeof db.update;

export type UpdateArgs = Parameters<UpdateFn>;

export type SetFn = ReturnType<UpdateFn>["set"];

export type SetArgs = Parameters<SetFn>;

export type DeleteFn = typeof db.delete;

export type DeleteArgs = Parameters<DeleteFn>;
