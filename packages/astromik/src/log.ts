import kleur from "kleur";
import { Routes } from "./types";

export default abstract class Log {
  static showRoutes(routes: Routes) {
    for (const route of [...routes.normal, ...routes.dynamic]) {
      const failedRoute = routes.failed.find((e) => e.route === route);

      const prefix = kleur.bold(
        failedRoute !== undefined ? kleur.red("✗") : kleur.green("✓")
      );

      console.log(
        `\n${prefix} ${route.path.replace(/\[/g, ":").replace(/\]/g, "")}`
      );
      for (const method of route.methods) {
        const spaces = Array(9 - method.method.length)
          .fill(" ")
          .join("");
        const line = route.methods.at(-1) === method ? "└" : "├";

        const prefix = kleur.bold(
          failedRoute?.methods.includes(method.method)
            ? kleur.red("✗")
            : kleur.green("✓")
        );
        console.log(
          `${prefix} ${line}─${method.method}${spaces}⟶  ${kleur.gray(
            method.file
          )}`
        );
      }
    }
    console.log("\n");
    if (routes.failed.length > 0) {
      const routesCount = routes.failed.length;
      console.log(
        kleur.bold(
          kleur.red(
            `✗ Failed to register ${routesCount} ${
              routesCount == 1 ? "route" : "routes"
            }`
          )
        )
      );
    } else {
      const routesCount = routes.normal.length + routes.dynamic.length;
      console.log(
        kleur.bold(
          kleur.green(
            `✓ Successfully registered ${routesCount} ${
              routesCount == 1 ? "route" : "routes"
            }`
          )
        )
      );
    }
  }
}
