import { HttpMethod, ReqResFunction, Methods } from "./utils";
export { Request, Response } from "express";

export class Route {
  private GET?: ReqResFunction;
  private POST?: ReqResFunction;
  private PUT?: ReqResFunction;
  private PATCH?: ReqResFunction;
  private DELETE?: ReqResFunction;
  private OPTIONS?: ReqResFunction;
  private HEAD?: ReqResFunction;

  get methods(): Methods {
    return {
      GET: this.GET,
      POST: this.POST,
      PUT: this.PUT,
      PATCH: this.PATCH,
      DELETE: this.DELETE,
      OPTIONS: this.OPTIONS,
      HEAD: this.HEAD,
    };
  }
}

export function Method<T extends ReqResFunction>(method: HttpMethod) {
  return function (
    target: Route,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): void {
    const original = descriptor.value;
    Object.defineProperty(target, method, {
      value: original,
    });
  };
}
