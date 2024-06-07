import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

async function generateOpenApiFile() {
  try {
    const response = await fetch("http://localhost:3000/api/ts-rest/open-api", {
      method: "GET",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = await response.json();
    if (!json) return;

    const content = `const openapi = ${JSON.stringify(json)} as const
export default openapi
			`;

    const generatedPath = path.resolve("src/generated");

    if (!existsSync(generatedPath)) {
      mkdirSync(generatedPath);
    }

    writeFileSync(path.join(generatedPath, `openapi.ts`), content);
  } catch (e) {
    console.log("💀 Client types not generated");
  }
}

void generateOpenApiFile();
