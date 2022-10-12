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

  private async setupRoutes() {
    // check & create directory
    if (!fs.existsSync(this.routeDirectory)) fs.mkdirSync(this.routeDirectory);

    // get directory structure
    const routesDir = new Directory(this.routeDirectory);

    const routeFiles: File[] = [];
    const dynamicRouteFiles: File[] = [];

    // sperarate dynamic routes
    for (const item of routesDir.items) {
      if (item.name.match(/\[[a-z]+\]/)) {
        dynamicRouteFiles.push(item);
      } else {
        routeFiles.push(item);
      }
    }

    // register normal routes
    for (const file of routeFiles) {
      if (file.isDirectory) continue;
      const fileName = Path.parse(file.path).name;
      const route = fileName === "index" ? "" : fileName;

      await this.registerRoute(route, file);
    }

    // register dynamic routes
    for (const file of dynamicRouteFiles) {
      if (file.isDirectory) continue;
      const fileName = Path.parse(file.path).name;
      const route = `:${fileName.replace(/[\[\]]/g, "")}`;

      await this.registerRoute(route, file);
    }

    // fallback route
    this.express.use((_, res) => res.sendStatus(404));
  }

  private async registerRoute(route: string, file: File) {
    try {
      // dynamicly import handler
      const RouteHandler: typeof Route = (
        await import(file.path.replace(/.ts$|.js$/, ""))
      ).default;

      const handler: Route = new RouteHandler();

      // register http methods
      this.express.get(`/${route}`, (req, res) => {
        handler.init(req, res);
        handler.GET();
      });
      this.express.post(`/${route}`, (req, res) => {
        handler.init(req, res);
        handler.POST();
      });
      this.express.patch(`/${route}`, (req, res) => {
        handler.init(req, res);
        handler.PATCH();
      });
      this.express.delete(`/${route}`, (req, res) => {
        handler.init(req, res);
        handler.DELETE();
      });
    } catch {
      return;
    }
  }

  public start(port: number, callback?: () => void) {
    this.setupRoutes();
    this.express.listen(port, callback);
  }
}
