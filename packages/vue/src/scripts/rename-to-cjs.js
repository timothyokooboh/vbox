// scripts/rename-to-cjs.js

import { rename, access } from "fs/promises";
import { constants } from "fs";

const input = "dist/generate-types.js";
const output = "dist/generate-types.cjs";

async function run() {
  try {
    // Check if the input file exists
    await access(input, constants.F_OK);

    // Rename .js → .cjs
    await rename(input, output);

    console.log(`Renamed: ${input} → ${output}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`⚠️ File not found: ${input} (skipping rename)`);
    } else {
      console.error("Rename failed:", err);
      process.exit(1);
    }
  }
}

run();
