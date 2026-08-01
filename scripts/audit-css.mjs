import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const cssExtensions = new Set([".css"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".html"]);
const ignoredDirectories = new Set(["node_modules", "dist", "coverage", ".git"]);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

function extractClassSelectors(css) {
  const selectors = new Set();
  const rulePattern = /(^|})\s*([^@{}][^{}]*)\{/gm;

  for (const match of css.matchAll(rulePattern)) {
    const selectorGroup = match[2];
    for (const classMatch of selectorGroup.matchAll(/\.([a-zA-Z_][\w-]*)/g)) {
      selectors.add(classMatch[1]);
    }
  }

  return selectors;
}

function extractSelectorGroups(css) {
  const selectors = [];
  const rulePattern = /(^|})\s*([^@{}][^{}]*)\{/gm;

  for (const match of css.matchAll(rulePattern)) {
    const group = match[2]
      .split(",")
      .map((selector) => selector.trim().replace(/\s+/g, " "))
      .filter(Boolean);
    selectors.push(...group);
  }

  return selectors;
}

async function main() {
  const allFiles = await walk(sourceRoot);
  const cssFiles = allFiles.filter((file) => cssExtensions.has(path.extname(file)));
  const sourceFiles = allFiles.filter((file) => sourceExtensions.has(path.extname(file)));

  const sourceText = (
    await Promise.all(sourceFiles.map((file) => fs.readFile(file, "utf8")))
  ).join("\n");

  const selectorLocations = new Map();
  const classLocations = new Map();

  for (const file of cssFiles) {
    const css = await fs.readFile(file, "utf8");
    const fileName = relative(file);

    for (const selector of extractSelectorGroups(css)) {
      const locations = selectorLocations.get(selector) ?? [];
      locations.push(fileName);
      selectorLocations.set(selector, locations);
    }

    for (const className of extractClassSelectors(css)) {
      const locations = classLocations.get(className) ?? [];
      locations.push(fileName);
      classLocations.set(className, locations);
    }
  }

  const duplicateSelectors = [...selectorLocations.entries()]
    .filter(([, locations]) => new Set(locations).size > 1)
    .sort(([left], [right]) => left.localeCompare(right));

  const possiblyUnusedClasses = [...classLocations.entries()]
    .filter(([className]) => !sourceText.includes(className))
    .sort(([left], [right]) => left.localeCompare(right));

  console.log(`CSS files scanned: ${cssFiles.length}`);
  console.log(`Source files scanned: ${sourceFiles.length}`);
  console.log("");

  console.log(`Duplicate selectors across files: ${duplicateSelectors.length}`);
  for (const [selector, locations] of duplicateSelectors) {
    console.log(`  ${selector}`);
    for (const location of [...new Set(locations)]) {
      console.log(`    - ${location}`);
    }
  }

  console.log("");
  console.log(`Possibly unused class selectors: ${possiblyUnusedClasses.length}`);
  console.log("These are candidates only; dynamic class construction can produce false positives.");
  for (const [className, locations] of possiblyUnusedClasses) {
    console.log(`  .${className} — ${[...new Set(locations)].join(", ")}`);
  }
}

main().catch((error) => {
  console.error("CSS audit failed.", error);
  process.exitCode = 1;
});
