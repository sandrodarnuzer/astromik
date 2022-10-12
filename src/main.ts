import express, { json, urlencoded } from "express";
import { Lib } from "./lib";

const app = express();

const server = new Lib(app);

app.use(json());
server.start(4000, () => console.log("ready"));
