import express, { Express } from "express";
import fs from "fs";
import { Directory } from "./file";
import Path from "path";
import { HttpMethod, Handler, Route, Routes, Middleware } from "./types";
import Log from "./log";

export { Handler } from "./types";

const ROUTES_DIRECTORY = Path.join(Path.dirname(process.argv[1]), "routes");

const methods: HttpMethod[] = ["GET", "POST", "PATCH", "PUT", "DELETE"];

export class Astromik {
  public express: Express;
  private routeDirectory: string = ROUTES_DIRECTORY;
  private routes: Routes;

  constructor() {
    this.express = express();
    this.routes = {
      normal: [],
      dynamic: [],
      failed: [],
    };
  }

  public use(handler: Middleware) {
    this.express.use(handler);
  }

  private setupRoutes(directory: Directory, root: boolean = false) {
    // check & create directory
    if (!fs.existsSync(directory.path)) return;

    const path = directory.path
      .replace(this.routeDirectory, "/")
      .replace(/(\/\/)/, "/");

    const route: Route = {
      path: path,
      methods: [],
    };

    for (const item of directory.items) {
      if (item.isDirectory) {
        this.setupRoutes(item as Directory);
      }

      const methodName = item.name
        .replace(/(.ts)$|(.js)$/, "")
        .toUpperCase() as HttpMethod;
      if (!methods.includes(methodName)) continue;

      route.methods.push({
        method: methodName,
        file: item.path,
      });
    }
    if (route.path.match(/\[.+\]/)) this.routes.dynamic.push(route);
    else this.routes.normal.push(route);
  }

  private async registerRoutes() {
    for (const route of [...this.routes.normal, ...this.routes.dynamic]) {
      const failedMethods: HttpMethod[] = [];
      for (const method of route.methods) {
        try {
          const handler: Handler = (await import(method.file)).default;
          const path = route.path.replace(/\[/g, ":").replace(/\]/g, "");
          switch (method.method) {
            case "GET":
              this.express.get(path, handler);
              break;
            case "POST":
              this.express.post(path, handler);
              break;
            case "PATCH":
              this.express.patch(path, handler);
              break;
            case "PUT":
              this.express.put(path, handler);
              break;
            case "DELETE":
              this.express.delete(path, handler);
              break;
          }
        } catch (error: any) {
          failedMethods.push(method.method);
        }
      }

      if (failedMethods.length > 0) {
        this.routes.failed.push({
          route: route,
          methods: failedMethods,
        });
      }
    }
  }

  public start(port: number, callback?: () => void) {
    this.setupRoutes(new Directory(this.routeDirectory), true);
    this.registerRoutes().then(() => {
      Log.showRoutes(this.routes);
      console.log("\n");
      this.express.listen(port, callback);
    });
  }
}
