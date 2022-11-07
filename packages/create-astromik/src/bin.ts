import prompts from "prompts";
import kleur from "kleur";
import { cwd } from "process";
import { basename, join } from "path";
import {
  copy,
  mkdir,
  readdir,
  pathExists,
  readJson,
  writeJson,
  readFile,
  writeFile,
} from "fs-extra";

(async () => {
  const response = await prompts([
    {
      type: "text",
      name: "dir",
      message:
        "Directory of your project? (leave blank to use current directory)",
    },
    {
      type: "toggle",
      name: "typescript",
      message: "Use Typescript? (Recommended)",
      initial: true,
      active: "yes",
      inactive: "no",
    },
  ]);

  const currentDir = cwd();
  const templatesDir = join(__dirname, "..", "templates");

  const template = response.typescript ? "ts" : "js";
  const sharedDir = join(templatesDir, "shared");
  const templateDir = join(templatesDir, template);

  const projectDir = join(currentDir, response.dir);
  const name = basename(projectDir);

  if (!pathExists(projectDir)) await mkdir(projectDir);

  for (const directory of [sharedDir, templateDir]) {
    const files = await readdir(directory);

    for (const file of files) {
      if (file === "package.json") {
        const content = (await readFile(join(directory, file))).toString();
        await writeFile(
          join(projectDir, file),
          content.replace("~NAME~", name)
        );
      } else {
        await copy(
          join(directory, file),
          join(projectDir, file.replace("DOT-", "."))
        );
      }
    }
  }

  console.log(kleur.bold(kleur.green("\nSuccessfully created project")));
  console.log(kleur.bold("\nNext steps:"));
  if (response.dir !== "")
    console.log(
      `- Change into directory:\n  ${kleur.bold(kleur.cyan(`cd ${name}`))}\n`
    );

  console.log(
    `- Install dependencies:\n  ${kleur.bold(kleur.cyan("npm install"))}\n`
  );
  console.log(
    `- Start development server:\n  ${kleur.bold(kleur.cyan("npm run dev"))}\n`
  );
})();
