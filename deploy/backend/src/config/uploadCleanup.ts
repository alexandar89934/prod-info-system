import fs from "fs";
import path from "path";

import { logger } from "#logger";

const TEMP_DIR = path.resolve(__dirname, "../uploads/temp");
const MAX_AGE_MS = 30 * 60 * 1000;

const cleanTempUploads = (): void => {
  if (!fs.existsSync(TEMP_DIR)) return;

  const now = Date.now();
  for (const file of fs.readdirSync(TEMP_DIR)) {
    const filePath = path.join(TEMP_DIR, file);
    try {
      const { mtimeMs } = fs.statSync(filePath);
      if (now - mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted orphaned temp upload: ${file}`);
      }
    } catch {
      // file may have been deleted between readdir and unlink
    }
  }
};

export const startUploadCleanup = (): void => {
  setInterval(cleanTempUploads, MAX_AGE_MS);
};