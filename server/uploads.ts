import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
export const uploadsDir = path.resolve(currentDir, "../uploads");

export function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure directory exists on module load
ensureUploadsDir();
