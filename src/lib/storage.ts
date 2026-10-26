import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

/**
 * Ensures data directory exists
 */
function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Error creating data dir:", err);
  }
}

/**
 * Load persistent tenant data from disk
 */
export function loadStorageFromDisk<T>(): Record<string, T> | null {
  try {
    ensureDataDir();
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading storage from disk:", err);
  }
  return null;
}

/**
 * Save persistent tenant data to disk
 */
export function saveStorageToDisk<T>(data: Record<string, T>): void {
  try {
    ensureDataDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving storage to disk:", err);
  }
}
