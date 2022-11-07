const { Astromik } = require("astromik");

const server = new Astromik();

server.start(4000, () => console.log("Server started..."));
