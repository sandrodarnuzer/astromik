import { HttpMethod, ReqResFunction, Methods } from "./utils";
export { Request, Response } from "express";

export class Route {
  private GET?: ReqResFunction;
  private POST?: ReqResFunction;
  private PATCH?: ReqResFunction;
  private DELETE?: ReqResFunction;

  readonly methods: Methods = {
    GET: this.GET,
    POST: this.POST,
    PATCH: this.PATCH,
    DELETE: this.DELETE,
  };
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
