/**
 * This script generates the `src/generated/trpc`-files which have faster autocompletion to type than the `src/utils/trpc.ts` file.
 *
 * When adding/removing a new router, you need to run `npm i` or `npm run postinstall` to generate the new files.
 */
import fs from "fs";
import path from "path";
import { globSync } from "glob";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const ROOT_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.resolve(ROOT_DIR, "src");

interface Template {
  /** everything after `/src/` and before `.ts` */
  tsPath: string;
  /** lowercase router name used for instances e.g. 'xero' */
  routerInstance: string;
  /** uppercase router name used for types e.g. 'Xero' */
  routerType: string;
}

const globPaths = globSync(
  [
    // Two paths are here while we move to modules
    `${SRC_DIR}/routers/root.ts`,
    `${SRC_DIR}/routers/**/*.router.ts`,
  ],
  {
    withFileTypes: true,
    nodir: true,
  },
);

const globFileNames = globPaths
  .filter((it) => it.isFile())
  .map(function toTemplate(it): Template {
    const fileName = it.name.replace(".ts", "");
    const relativePath = it.path.substring(SRC_DIR.length + 1);

    const tsPath = `${relativePath}/${fileName}`;
    const routerInstance = fileName.replace(".router", "").replace("_", "");
    const routerType = routerInstance;

    return {
      tsPath,
      routerInstance,
      routerType,
    };
  });

const TEMPLATE = fs
  .readFileSync(`${__dirname}/trpc-routers.template.ts`, "utf-8")
  .toString()
  // remove any '// @ts-expect-error' comments
  .replace(/\/\/ @ts-expect-error.*/g, "");

const TARGET_DIR = `${__dirname}/../src/generated/trpc`;

// first delete target dir if it exists
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true });
}

// then create it again
fs.mkdirSync(TARGET_DIR, { recursive: true });

for (const { routerInstance, routerType, tsPath } of globFileNames) {
  const out = TEMPLATE.replaceAll("__TS_PATH__", tsPath)
    .replaceAll("__ROUTER_TYPE__", routerType)
    .replaceAll("__ROUTER_INSTANCE__", routerInstance);

  console.log(`Writing ${routerInstance}.ts`);

  fs.writeFileSync(`${TARGET_DIR}/${routerInstance}.ts`, out);
}
