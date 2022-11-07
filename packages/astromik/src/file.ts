import fs from "fs";
import { basename, join } from "path";

export class File {
  private _path: string;
  private _name: string;
  private _isDirectory: boolean;

  constructor(path: string, isDir: boolean = false) {
    this._path = path;
    this._name = basename(path);
    this._isDirectory = isDir;
  }

  get isDirectory(): boolean {
    return this._isDirectory;
  }

  get path(): string {
    return this._path;
  }

  get name(): string {
    return this._name;
  }
}

export class Directory extends File {
  private _items: File[] = [];

  constructor(path: string) {
    super(path, true);
    this.getItems();
  }

  get items(): File[] {
    return this._items;
  }

  private getItems() {
    const items = fs.readdirSync(this.path, { withFileTypes: true });

    for (const item of items) {
      const filePath = join(this.path, item.name);

      this._items.push(
        item.isDirectory() ? new Directory(filePath) : new File(filePath)
      );
    }
  }
}
