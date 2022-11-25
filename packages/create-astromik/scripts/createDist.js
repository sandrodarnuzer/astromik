const { copySync, rmSync } = require("fs-extra");
const { join } = require("path");

const cwd = process.cwd();
const build = join(cwd, "build");
const src = join(build, "src");
const dist = join(cwd, "dist");

copySync(src, dist, {
  recursive: true,
});

rmSync(build, {
  recursive: true,
});
