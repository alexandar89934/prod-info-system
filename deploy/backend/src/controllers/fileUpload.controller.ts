import fs from "fs";
import path from "path";

import { Request, Response } from "express";
import mime from "mime-types";

const uploadsDir = path.join(__dirname, "../uploads");

const resolveUploadPath = (filename: string): string | null => {
  const tempFull = path.join(uploadsDir, "temp", filename);
  const permFull = path.join(uploadsDir, filename);
  if (fs.existsSync(tempFull)) return tempFull;
  if (fs.existsSync(permFull)) return permFull;
  return null;
};

export const uploadSingleFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = `/uploads/temp/${req.file.filename}`;
  return res
    .status(200)
    .json({ path: filePath, name: req.file.filename, dateAdded: new Date() });
};

export const viewFile = (req: Request, res: Response) => {
  const { filename } = req.params;

  if (!filename) {
    return res.status(400).json({ success: false, message: "No filename provided" });
  }

  const fullPath = resolveUploadPath(path.basename(filename));

  if (!fullPath) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  const mimeType = mime.lookup(filename) || "application/octet-stream";
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${path.basename(filename)}"`);
  return fs.createReadStream(fullPath).pipe(res);
};

export const deleteFile = (req: Request, res: Response) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res
      .status(400)
      .json({ success: false, message: "No file path provided" });
  }

  const fullPath = resolveUploadPath(path.basename(filePath));

  if (!fullPath) {
    return res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  }

  try {
    fs.unlinkSync(fullPath);
    return res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete file" });
  }
};