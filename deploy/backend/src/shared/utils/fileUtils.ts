import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

export const deleteFileIfExists = (filePath: string): void => {
  const filename = path.basename(filePath);
  const tempFull = path.join(UPLOADS_DIR, "temp", filename);
  const permFull = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(tempFull)) {
    fs.unlinkSync(tempFull);
  } else if (fs.existsSync(permFull)) {
    fs.unlinkSync(permFull);
  }
};

export const deleteFilesIfExist = (paths: string[]): void => {
  paths.forEach(deleteFileIfExists);
};

export const promoteFile = (filePath: string): string => {
  const filename = path.basename(filePath);
  if (!filePath.includes("/temp/")) return filePath;

  const tempFull = path.join(UPLOADS_DIR, "temp", filename);
  const permFull = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(tempFull)) {
    fs.renameSync(tempFull, permFull);
  }

  return `/uploads/${filename}`;
};