import fs from "fs/promises";

import type { runCli } from "../cli";
import { ROUTERSFOLDER } from "../cli";

export const createRouter = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  //Let's assume the router exists and has at least one key.

  const fileContent = "await fs.readFile(userInput.routerPath, ";

  const regex = /export\s+const\s+\w+Router/g;

  // ts.forEachChild(sourceFile, (node) => {
  //   if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) {
  //     // Check if it's exporting 'appwerggRouter'
  //     if (node.expression.text === "appwerggRouter") {
  //       // Extracting existing content and adding new entry
  //       const start = node.getStart();
  //       const end = node.getEnd();
  //       const existingContent = fileContent.slice(start, end - 1); // Removing `;` from end
  //       const newEntry = "newKey: newValue,";
  //       const newContent =
  //         fileContent.slice(0, end - 1) + newEntry + fileContent.slice(end - 1);

  //       console.log("New entry added:", newEntry);
  //     }
  //   }
  // });
  //We need to

  try {
    // Read the TypeScript file
    let data = await fs.readFile(userInput.routerPath, "utf-8");

    // Locate the userRouter object
    const objectStartIndex = data.indexOf("export const userRouter = {");
    if (objectStartIndex === -1) {
      console.error("Object not found in file");
      return;
    }

    const objectEndIndex = data.indexOf(
      "} satisfies TRPCRouterRecord;",
      objectStartIndex,
    );
    if (objectEndIndex === -1) {
      console.error("Object end not found in file");
      return;
    }

    const objectContent = data.substring(objectStartIndex, objectEndIndex + 1);

    // Parse the object's content
    const userRouter = eval(`(${objectContent})`);

    // Add new entry to the object
    userRouter.newQuery = "newQueryHandler";

    // Convert the modified object back to string
    const modifiedObjectContent = JSON.stringify(userRouter, null, 2);

    // Replace the old object content with the modified one
    data = data.replace(objectContent, modifiedObjectContent);

    // Write the modified data back to the file
    await fs.writeFile("path/to/your/file.ts", data, "utf-8");
    console.log("File updated successfully");
  } catch (error) {
    console.error("Error:", error);
  }
};
