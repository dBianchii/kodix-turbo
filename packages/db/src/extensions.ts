// import { camelCase } from "string-ts";

import { Prisma } from "./index";

export function _wsPrisma() {
  return Prisma.defineExtension((prisma) => {
    return prisma;
    // return prisma.$extends({
    //   name: "wsPrisma", //Optional: name appears in errorLogs
    //   query: {
    //     $allModels: {
    //       async $allOperations({ query, args, model, operation }) {
    //         const camelCaseModel = camelCase(model);
    //         if ("teamId" in ) {
    //           if (operation !== "createMany" && operation !== "create") {
    //             args.where = {
    //               ...args.where,
    //               teamId,
    //             };
    //           }
    //         }
    //         return query(args);
    //       },
    //     },
    //   },
    // });
  });
}
