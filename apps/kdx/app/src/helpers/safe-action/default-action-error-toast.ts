import { toast } from "@kodix/ui/toast";

/**
 * Used with onError in useAction to display a toast error message
 */
export const defaultSafeActionToastError = (error: {
  serverError?: string | undefined;
  validationErrors?:
    | {
        formErrors: string[];
        fieldErrors: Record<string, string[] | undefined>;
      }
    | undefined;
  bindArgsValidationErrors?: readonly [] | undefined;
  fetchError?: string;
}) => {
  let errorMessage =
    error.serverError ??
    error.validationErrors?.formErrors[0] ??
    error.fetchError;

  if (!errorMessage && error.validationErrors?.fieldErrors.length) {
    const fieldErrors = Object.entries(error.validationErrors.fieldErrors);
    const firstErrorMessage = fieldErrors[0]?.[1]?.[0];
    if (firstErrorMessage) {
      errorMessage = firstErrorMessage;
    }
  }

  toast.error(errorMessage);
};
