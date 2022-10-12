import { Express } from "express";
import fs from "fs";
import { Directory, File } from "./file";
import { Route } from "./route";
import Path from "path";

const CWD = process.cwd();
const ROUTES_DIR_PATH = Path.join(CWD, "routes");

export { Route } from "./route";

export class Astromik {
  private express: Express;
  private routeDirectory: string = ROUTES_DIR_PATH;

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
    console.log(`register route: '${route}'`);
    try {
      // dynamicly import handler
      const RouteHandler: typeof Route = (
        await import(file.path.replace(/.ts$|.js$/, ""))
      ).default;

      const handler: Route = new RouteHandler();

      // register http methods
      this.express.get(route, (req, res) => {
        handler.init(req, res);
        handler.GET();
      });
      this.express.post(route, (req, res) => {
        handler.init(req, res);
        handler.POST();
      });
      this.express.patch(route, (req, res) => {
        handler.init(req, res);
        handler.PATCH();
      });
      this.express.delete(route, (req, res) => {
        handler.init(req, res);
        handler.DELETE();
      });
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
