import { Route } from "./route";
import { ReqResFunction, Request, Response, NextFunction } from "./utils";

export function Middleware<T extends ReqResFunction>(
  middleware: (req: Request, res: Response, next: NextFunction) => void
) {
  return function (
    target: Route,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): void {
    const original = descriptor.value ?? (() => {});
    const func: ReqResFunction = (req: Request, res: Response) => {
      middleware(req, res, () => {
        original(req, res);
      });
    };

    descriptor.value = func as T;
  };
}
