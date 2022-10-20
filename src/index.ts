import { Express } from "express";
import fs from "fs";
import { Directory, File } from "./file";
import { Route } from "./route";
import Path from "path";
import { HttpMethod } from "./utils";

export { Route } from "./route";
export { Request, Response, NextFunction } from "./utils";
export { Method } from "./method";
export { Middleware } from "./middleware";

const ROUTES_DIRECTORY = Path.join(Path.dirname(process.argv[1]), "routes");

export class Astromik {
  private express: Express;
  private routeDirectory: string = ROUTES_DIRECTORY;

  constructor(express: Express) {
    this.express = express;
  }

  private async setupRoutes(directory: Directory, root: boolean = false) {
    // check & create directory
    if (!fs.existsSync(directory.path)) return;

    const routeFiles: File[] = [];
    const dynamicRouteFiles: File[] = [];

    // sperarate dynamic routes
    for (const item of directory.items) {
      if (item.name.match(/\[[a-z]+\]/)) {
        dynamicRouteFiles.push(item);
      } else {
        routeFiles.push(item);
      }
    }

    // resolve path prefix from parent folders
    const prefix = directory.path
      .replace(this.routeDirectory, "")
      .replace(/\[/g, ":")
      .replace(/\]/g, "");

    // register normal routes
    for (const file of routeFiles) {
      if (file.isDirectory) {
        await this.setupRoutes(file as Directory);
        continue;
      }
      const fileName = file.name;
      const route = Path.join(
        "/",
        root ? "" : prefix,
        fileName.match(/index.(ts|js)$/)
          ? ""
          : fileName.replace(/.ts$|.js$/, "")
      );

      await this.registerRoute(route, file);
    }

    // register dynamic routes
    for (const file of dynamicRouteFiles) {
      if (file.isDirectory) {
        await this.setupRoutes(file as Directory);
        continue;
      }
      const fileName = Path.parse(file.path).name;
      const route = Path.join(
        "/",
        root ? "" : prefix,
        `:${fileName.replace(/[\[\]]/g, "")}`
      );

      await this.registerRoute(route, file);
    }
  }

  private async registerRoute(route: string, file: File) {
    try {
      // dynamicly import handler
      const handler: typeof Route = (
        await import(file.path.replace(/.ts$|.js$/, ""))
      ).default;

      // register http methods
      for (const entry of Object.entries(handler.prototype.methods)) {
        const method = entry[0] as HttpMethod;
        const func = entry[1];

        if (!func) continue;

        switch (method) {
          case "GET":
            this.express.get(route, func);
            break;
          case "POST":
            this.express.post(route, func);
            break;
          case "PUT":
            this.express.put(route, func);
            break;
          case "PATCH":
            this.express.patch(route, func);
            break;
          case "DELETE":
            this.express.delete(route, func);
            break;
          case "OPTIONS":
            this.express.options(route, func);
            break;
          case "HEAD":
            this.express.head(route, func);
            break;
        }
        console.log(`${method} ${route}`);
      }
    } catch (error: any) {
      console.log(error);
      return;
    }
  }

  public start(port: number, callback?: () => void) {
    this.setupRoutes(new Directory(this.routeDirectory), true).then(() => {
      this.express.listen(port, callback);
    });
  }
}
