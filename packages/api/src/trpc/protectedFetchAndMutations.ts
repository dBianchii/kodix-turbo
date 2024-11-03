import { TRPCError } from "@trpc/server";

async function iteratePermissionResults(
  results: PermissionCheckResult[] | PermissionCheckResult,
) {
  let errors: TRPCError[] = [];
  if (Array.isArray(results)) {
    // eslint-disable-next-line no-restricted-syntax
    const awaitedResults = await Promise.all(results);
    errors = awaitedResults.filter((result) => result != undefined);
  } else {
    const awaitedResult = await results;
    if (awaitedResult != undefined) {
      errors = [awaitedResult];
    }
  }
  if (errors.length > 0) {
    // Ugly
    const errorMessages = [
      ...new Set(errors.map((error) => error.message)),
    ].join("\n");
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: errorMessages,
    });
  }
}

async function validatePermissionsWithData<T>(
  permissions: PermissionsChecksWithData<T>,
  data: T,
) {
  if (Array.isArray(permissions)) {
    const permissionResults = permissions.map((permission) => permission(data));
    // flatten
    const flattenedPermissionResults = permissionResults.flat();
    await iteratePermissionResults(flattenedPermissionResults);
  } else {
    await iteratePermissionResults(permissions(data));
  }
}

async function findOrThrowNotFound<T>(
  find: () => Promise<T | null | undefined> | undefined,
  message: string,
) {
  const data = await find();
  if (!data) throw new TRPCError({ code: "NOT_FOUND", message });
  return data;
}

type PermissionCheckResult = Promise<TRPCError | void> | (TRPCError | void);

type PermissionsChecksWithData<T> =
  | ((data: T) => PermissionCheckResult | PermissionCheckResult[])[]
  | ((data: T) => PermissionCheckResult | PermissionCheckResult[]);

interface ProtectedFetchInput<T> {
  fetch: () => Promise<T | null | undefined>;
  permissions: PermissionsChecksWithData<T>;
  notFoundMessage: string;
}
export async function protectedFetch<T>({
  fetch,
  permissions,
  notFoundMessage,
}: ProtectedFetchInput<T>) {
  const data = await findOrThrowNotFound(fetch, notFoundMessage);
  await validatePermissionsWithData(permissions, data);
  return data;
}

async function validatePermissions(permissions: PermissionsChecks) {
  if (Array.isArray(permissions)) {
    await iteratePermissionResults(
      permissions.map((permission) => permission()).flat(),
    );
  } else {
    await iteratePermissionResults(permissions());
  }
}
type PermissionsChecks =
  | (() => PermissionCheckResult | PermissionCheckResult[])[]
  | (() => PermissionCheckResult | PermissionCheckResult[]);
interface ProtectedMutationInput<T> {
  operation: () => Promise<T>;
  permissions: PermissionsChecks;
}
export async function protectedMutation<T>({
  operation,
  permissions,
}: ProtectedMutationInput<T>) {
  await validatePermissions(permissions);
  return operation();
}

type ProtectedMutationFetchFirstInput<T, F> = ProtectedFetchInput<T> & {
  operation: (data: T) => Promise<F>;
};
export async function protectedMutationFetchFirst<T, F>({
  operation,
  ...input
}: ProtectedMutationFetchFirstInput<T, F>) {
  const data = await protectedFetch(input);
  // TODO: Extra permission checks here?
  return operation(data);
}
