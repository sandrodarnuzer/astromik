import { Request, request, Response, response } from "express";

export class Route {
  protected request = request;
  protected response = response;

  init(request: Request, response: Response) {
    this.request = request;
    this.response = response;
  }

  GET() {
    response.sendStatus(404);
  }
  POST() {
    response.sendStatus(404);
  }
  PATCH() {
    response.sendStatus(404);
  }
  DELETE() {
    response.sendStatus(404);
  }
}
