import fs from "fs";
import path from "path";

import { Request, Response } from "express";

export const uploadSingleFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;
  return res
    .status(200)
    .json({ path: filePath, name: req.file.filename, dateAdded: new Date() });
};

export const deleteFile = (req: Request, res: Response) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res
      .status(400)
      .json({ success: false, message: "No file path provided" });
  }

  const filename = path.basename(filePath);
  const fullPath = path.join(__dirname, "../uploads", filename);

  if (!fs.existsSync(fullPath)) {
    return res
      .status(404)
      .json({ success: false, message: "File not found" });
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
