import { db } from "@kdx/db/client";

import { getLocaleBasedOnCookie } from "../utils/locales";

export const createCronJobCtx = () => {
  return {
    locale: getLocaleBasedOnCookie(),
    db,
  };
};
export type TCronJobContext = ReturnType<typeof createCronJobCtx>;

// export const cronJob =
//   (
//     handler: ({
//       req,
//       res,
//       ctx,
//     }: {
//       req: NextRequest;
//       res: NextResponse;
//       ctx: TCronJobContext;
//     }) => Promise<void>,
//   ) =>
//   async (req: NextRequest, res: NextResponse) => {
//     const ctx = createCronJobCtx();

//     return handler({
//       req,
//       res,
//       ctx,
//     });
//   };
