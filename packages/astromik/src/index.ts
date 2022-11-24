import express, { Express } from "express";
import fs from "fs";
import { Directory } from "./file";
import Path from "path";
import { HttpMethod, Handler, Route, Routes, Middleware } from "./types";
import Log from "./log";

export { json, text, raw, urlencoded } from "body-parser";
export { Handler, Middleware, Request, Response, NextFunction } from "./types";

const ROUTES_DIRECTORY = Path.join(Path.dirname(process.argv[1]), "routes");

const methods: HttpMethod[] = [
  "GET",
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

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

  public use(handler: Handler) {
    this.express.use(handler);
  }

  private setupRoutes(directory: Directory) {
    // check & create directory
    if (!fs.existsSync(directory.path)) return;

    const path = directory.path
      .replace(this.routeDirectory, "/")
      .replace(/\\/g, "/")
      .replace(/(\/\/)/g, "/");

    const route: Route = {
      path: path,
      methods: [],
    };

    for (const item of directory.items) {
      if (item.isDirectory) {
        this.setupRoutes(item as Directory);
      }

      const methodName = item.name
        .replace(/(\..+)?((\.ts)$|(\.js)$)/, "")
        .toUpperCase() as HttpMethod;
      if (!methods.includes(methodName)) continue;

      route.methods.push({
        method: methodName,
        file: item.path,
      });
    }

    if (route.methods.length < 1) return;
    if (route.path.match(/\[.+\]/)) this.routes.dynamic.push(route);
    else this.routes.normal.push(route);
  }

  private async registerRoutes() {
    for (const route of [...this.routes.normal, ...this.routes.dynamic]) {
      const failedMethods: HttpMethod[] = [];
      for (const method of route.methods) {
        try {
          const module = await import(method.file);
          const handler: Handler | undefined = module.handler;

          if (!handler) throw new Error();

          const middleware: Middleware = module.middleware ?? [];

          const path = route.path.replace(/\[/g, ":").replace(/\]/g, "");
          switch (method.method) {
            case "GET":
              this.express.get(path, ...middleware, handler);
              break;
            case "POST":
              this.express.post(path, ...middleware, handler);
              break;
            case "PATCH":
              this.express.patch(path, ...middleware, handler);
              break;
            case "PUT":
              this.express.put(path, ...middleware, handler);
              break;
            case "DELETE":
              this.express.delete(path, ...middleware, handler);
              break;
            case "OPTIONS":
              this.express.options(path, ...middleware, handler);
              break;
            case "HEAD":
              this.express.head(path, ...middleware, handler);
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
    this.setupRoutes(new Directory(this.routeDirectory));
    this.registerRoutes().then(() => {
      Log.showRoutes(this.routes);
      console.log("\n");
      this.express.listen(port, callback);
    });
  }
}
