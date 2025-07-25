import { promises as fs } from "fs";
import { setMeticulousLocalDataDir } from "@alwaysmeticulous/common";
import { FileSystemService } from "../types";

export class DefaultFileSystemService implements FileSystemService {
  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(path: string): Promise<string> {
    return await fs.readFile(path, "utf-8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, "utf-8");
  }

  setMeticulousLocalDataDir(): void {
    setMeticulousLocalDataDir();
  }
}