import { Route } from "./route";
import { HttpMethod, ReqResFunction } from "./utils";

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
