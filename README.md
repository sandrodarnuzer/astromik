<p align="center">
  <img alt="Astromik" src="https://raw.githubusercontent.com/sndrnz/astromik/main/logo.png" width="256px" />
</p>

Backend framework based on express with folder based routing.

## Setup

`npm init astromik`

## Usage

### TS (Recommended)

src/main.ts

```ts
import { Astromik } from "astromik";

const server = new Astromik();

server.start(4000, () => console.log("Server started..."));
```

### JS

src/main.js

```js
const { Astromik } = require("astromik");

const server = new Astromik();

server.start(4000, () => console.log("Server started..."));
```

## Routing

Routing is based on the folder structure in the **src/routes** folder.
Each folder or subfolder represents the route it listens to and

For example to create a get route for **/login**, you create a folder called 'login' in **src/routes**. Within that folder you create a file named _get.ts_ or _get.js_. Note that the filename corresponds to the HTTP Method you want to register.

Supported methods: _GET, POST, PATCH, PUT, DELETE_

You simply export a function named _handler_ which gets called when a request for this specific route comes in. This function is exact like the handler function you would use in Express.

### TS (Recommended)

src/routes/get.ts

```ts
import { Handler } from "astromik";

export const handler: Handler = (req, res) => {
  res.send("Hello World!");
};
```

### JS

src/routes/get.js

```js
module.exports.handler = (req, res) => {
  res.send("Hello World!");
};
```

## Dynamic routing

For dynamic routing you name the folder with the following pattern: **[_param_]**, and then you can access the variable on the Request object, just like in Express.

For example, you create a folder: **src/routes/[id]**, you can then access the _id_ parameter with:

`const id = req.params.id`

### TS (Recommended)

src/routes/[id]/get.ts

```ts
import { Handler } from "astromik";

export const handler: Handler = (req, res) => {
  const id = req.params.id;
  res.send("Your id: ", id);
};
```

### JS

src/routes/[id]/get.js

```js
module.exports.handler = (req, res) => {
  const id = req.params.id;
  res.send("Your id: ", id);
};
```

## Middleware

To use middleware on your routes, you can export an array called _middleware_ which contains one or more handler functions.

**Note:** When you define a middleware handler function and don't send back any response, you need to call the **next** function, otherwise it will get stuck and won't execute any other handlers after this.

### TS (Recommended)

```ts
import { Handler, Middleware } from "astromik";

// middleware funcion
const logger: Handler = (req, res, next) => {
  console.log("Hello from middelware!");
  next();
};

export const middleware = [logger];

export const handler = (req, res) => {
  res.send("Hello World!");
};
```

### JS

```js
const logger = (req, res, next) => {
  console.log("Hello from middelware!");
  next();
};

module.exports.middleware = [logger];

module.exports.handler = (req, res) => {
  res.send("Hello World!");
};
```
