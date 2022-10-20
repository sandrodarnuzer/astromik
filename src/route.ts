import { ReqResFunction, Methods } from "./utils";

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
