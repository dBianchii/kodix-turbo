import { toast } from "@kdx/ui/toast";

interface ActionResult<Data> {
  data?: Data | undefined;
  serverError?: string | undefined;
  validationErrors?: Partial<Record<string, string[]>> | undefined;
}
/**
 * You can do it like this to show a toast on error
 * - if (defaultActionToastError(result)) return;
 * @param result The awaited result of a safe-action
 * @returns boolean indicating if there was an error or not.
 */
export const defaultSafeActionToastError = <Data>(
  result: ActionResult<Data>,
) => {
  if (result.validationErrors ?? result.serverError) {
    //We check if there are validation errors first, and if not, we show the server error.
    if (result.validationErrors) {
      const errorMessage = Object.values(result.validationErrors)[0];
      toast.error(errorMessage);
      return true;
    }

    toast.error(result.serverError);
    return true;
  }
  return false;
};
