import { Request, Response, NextFunction } from "express";
export type Handler = (req: Request, res: Response) => void;
export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

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
