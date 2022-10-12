import { Request, request, Response, response } from "express";

export class Route {
  protected request = request;
  protected response = response;

  init(request: Request, response: Response) {
    this.request = request;
    this.response = response;
  }

  GET() {
    this.response.sendStatus(404);
  }
  POST() {
    this.response.sendStatus(404);
  }
  PATCH() {
    this.response.sendStatus(404);
  }
  DELETE() {
    this.response.sendStatus(404);
  }
}
