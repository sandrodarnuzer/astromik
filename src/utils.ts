import { Request, Response } from "express";
export { Request, Response } from "express";
export type ReqResFunction = (req: Request, res: Response) => void;
export type NextFunction = () => void;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type Methods = {
  readonly [key in HttpMethod]?: ReqResFunction;
};
