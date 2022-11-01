<p align="center">
  <img alt="logo" src="logo.png" width="128px" />
  <h1 align="center">Astromik</h1>
</p>

Backend framework based on express with filesystem routing.

## Setup

`npm init astromik`

## Usage

```ts
import express from "express";
import { Astromik } from "astromik";

// create express app
const app = express();

// create astromik server
const server = new Astromik(app);
server.start(4000, () => console.log("Ready"));
```

## Routing

Routing is based on the filesystem so it mirrors the filestructure in the **src/routes** folder.

For example the route **/** would go to the file **src/routes/index.ts** and **/user/login** would go to the file **src/routes/user/login.ts**

### Basic routes

src/routes/index.ts

```ts
import { Route, Method, Request, Response } from "astromik";

// export default class which extends 'Route'
export default class extends Route {
  // Specify HTTP Method with the '@Method' decorator
  @Method("GET")
  home(req: Request, res: Response) {
    // access request and response object just like in express
    res.send("Hello world");
  }
}
```

### Dynamic routes

Dynamic routes are supported with the following naming schema: [*paramName*].ts.
A variable with the same name can then be accessed on the **params** object on the **req** variable.

src/routes/[id].ts

```ts
import { Route, Method, Request, Response } from "astromik";

export default class extends Route {
  @Method("GET")
  home(req: Request, res: Response) {
    // access the dynamic value 'id'
    res.send(`You entered: ${req.params.id}`);
  }
}
```

## Middleware

Middleware can be used with the **@Middleware** decorator. It requires a function very similar to Express middleware functions which takes in _req_, _res_ and _next_, and it behaves pretty much the same like Express.

```ts
import {
  Route,
  Method,
  Request,
  Response,
  Middleware,
  NextFunction,
} from "astromik";

function logger(req: Request, res: Response, next: NextFunction) {
  console.log("Hello from middleware!");
  next();
}

export default class extends Route {
  @Method("GET")
  @Middleware(logger)
  home(req: Request, res: Response) {
    res.send("Hello world");
  }
}
```
