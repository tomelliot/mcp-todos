import { IStorage } from "../types/todo.types";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../utils/logger";

/**
 * File-based storage implementation that reads and writes YAML files
 */
export class FileStorage implements IStorage<string> {
  private readonly filePath: string;

  /**
   * Creates a new FileStorage instance
   * @param baseDir - Base directory path where files will be stored
   * @param filename - Name of the file to store data in
   * @throws Error if baseDir is not provided
   */
  constructor(baseDir: string, filename: string) {
    logger.info({ baseDir, filename }, "FileStorage constructor");

    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    this.filePath = path.join(baseDir, filename);
  }

  /**
   * Reads YAML data from the file
   * @returns The file contents as a string
   */
  read(): string {
    try {
      if (!fs.existsSync(this.filePath)) {
        // Return empty array in YAML format if file doesn't exist
        return "[]";
      }
      return fs.readFileSync(this.filePath, "utf8");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to read from ${this.filePath}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Writes YAML data to the file
   * @param data - The YAML string to write
   */
  write(data: string): void {
    try {
      fs.writeFileSync(this.filePath, data, "utf8");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to write to ${this.filePath}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Gets the absolute path of the storage file
   */
  getFilePath(): string {
    return this.filePath;
  }
}
