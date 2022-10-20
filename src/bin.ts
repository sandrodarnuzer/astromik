import { exec } from "child_process";
import { basename, dirname, join } from "path";
import {
  writeFileSync,
  mkdirSync,
  existsSync,
  PathLike,
  createWriteStream,
} from "fs";

type Package = {
  name: string;
  version?: string;
  dev: boolean;
};

const cwd = process.cwd();
const args = process.argv;

const packages: Package[] = [
  {
    name: "astromik",
    dev: false,
  },
  {
    name: "typescript",
    dev: true,
  },
  {
    name: "ts-node",
    dev: true,
  },
  {
    name: "@types/express",
    dev: true,
  },
  {
    name: "@types/express",
    dev: true,
  },
];

const templates = {
  main: `import express from "express";
import { Astromik } from "astromik";

const app = express();

const server = new Astromik(app);
server.start(4000, () => console.log("Ready"));`,
  route: `import { Route, Method, Request, Response } from "astromik";

export default class extends Route {
  @Method("GET")
  home(req: Request, res: Response) {
    res.send("Hello world");
  }
}`,
  tsconfig: `{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "module": "commonjs",
    "rootDir": "src",
    "allowJs": true,
    "outDir": "build",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}`,
  packageJson: `{
  "name": "${basename(cwd)}",
  "version": "1.0.0",
  "description": "An astromik app",
  "main": "build/main.js",
  "scripts": {
    "start": "node build/main.js",
    "build": "tsc -p .",
    "dev": "ts-node src/main.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}`,
  gitignore: `.DS_Store
node_modules
build`,
};

function addPackage(pkg: string, dev: boolean = false) {}

function createDirectory(path: PathLike, recursive: boolean = false) {
  if (existsSync(path)) return;
  mkdirSync(path, {
    recursive,
  });
}

function addFile(path: PathLike, content: string) {
  const fileName = basename(path.toString());
  const dirName = dirname(path.toString());

  const filePath = join(cwd, dirName, fileName);

  createDirectory(dirName, true);
  writeFileSync(filePath, content);
}

function init() {
  console.log("Add files...");
  addFile("package.json", templates.packageJson);
  addFile("tsconfig.json", templates.tsconfig);
  addFile(".gitignore", templates.gitignore);
  addFile("src/main.ts", templates.main);
  addFile("src/routes/index.ts", templates.route);

  const deps: string[] = [];
  const devDeps: string[] = [];

  for (const pkg of packages) {
    if (pkg.dev) devDeps.push(pkg.name);
    else deps.push(pkg.name);
  }

  console.log("Installing dependencies...");
  exec(`npm install ${deps.join(" ")}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
  exec(`npm install -D ${devDeps.join(" ")}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
  console.log("Done!");
}

const action = args.at(2);

if (action) {
  switch (action) {
    case "init":
      init();
      break;
    default:
      console.error(`Unknown command: '${action}'`);
  }
} else {
  console.error("Usage: astromik init");
}
