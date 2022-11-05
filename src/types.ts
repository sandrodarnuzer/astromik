import { Handler } from "express";
export { Handler } from "express";

export type Middleware = Handler[];

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type Route = {
  path: string;
  methods: {
    method: HttpMethod;
    file: string;
  }[];
};

export type Routes = {
  normal: Route[];
  dynamic: Route[];
  failed: {
    methods: HttpMethod[];
    route: Route;
  }[];
};
