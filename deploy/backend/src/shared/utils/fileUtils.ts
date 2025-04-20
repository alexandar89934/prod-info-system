import fs from "fs";
import path from "path";

export const deleteFileIfExists = (relativePath: string): void => {
  const fullPath = path.join("/backend/src/", relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const deleteFilesIfExist = (paths: string[]): void => {
  paths.forEach(deleteFileIfExists);
};
