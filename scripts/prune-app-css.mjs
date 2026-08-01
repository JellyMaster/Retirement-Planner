import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appCssPath = path.join(root, "src", "App.css");

const authoritativeFiles = [
  "src/styles/layouts/app-shell.css",
  "src/styles/layouts/planner-page.css",
  "src/styles/layouts/planner-controls.css",
  "src/styles/layouts/planner-tables.css",
  "src/styles/layouts/chart-surfaces.css",
  "src/styles/layouts/chart-legends.css",
  "src/styles/layouts/milestone-cards.css",
  "src/styles/layouts/comparison-workspace.css",
  "src/styles/layouts/comparison-controls.css",
  "src/styles/layouts/comparison-results.css",
  "src/styles/layouts/summary-callouts.css",
  "src/styles/layouts/legacy-actions.css",
  "src/styles/layouts/drawdown-page.css",
  "src/styles/layouts/drawdown-controls.css",
  "src/styles/layouts/drawdown-tables.css",
].map((file) => path.join(root, file));

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");

function normaliseSelector(selector) {
  return selector.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").trim();
}

function splitSelectors(header) {
  const selectors = [];
  let current = "";
  let squareDepth = 0;
  let roundDepth = 0;
  let quote = null;

  for (let index = 0; index < header.length; index += 1) {
    const char = header[index];

    if (quote) {
      current += char;
      if (char === quote && header[index - 1] !== "\\") quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[") squareDepth += 1;
    if (char === "]") squareDepth -= 1;
    if (char === "(") roundDepth += 1;
    if (char === ")") roundDepth -= 1;

    if (char === "," && squareDepth === 0 && roundDepth === 0) {
      if (current.trim()) selectors.push(normaliseSelector(current));
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) selectors.push(normaliseSelector(current));
  return selectors;
}

function findMatchingBrace(css, openIndex) {
  let depth = 1;
  let quote = null;
  let inComment = false;

  for (let index = openIndex + 1; index < css.length; index += 1) {
    const char = css[index];
    const next = css[index + 1];

    if (inComment) {
      if (char === "*" && next === "/") {
        inComment = false;
        index += 1;
      }
      continue;
    }

    if (!quote && char === "/" && next === "*") {
      inComment = true;
      index += 1;
      continue;
    }

    if (quote) {
      if (char === quote && css[index - 1] !== "\\") quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return index;
  }

  throw new Error(`Unmatched opening brace at character ${openIndex}.`);
}

function parseBlocks(css) {
  const blocks = [];
  let cursor = 0;

  while (cursor < css.length) {
    const openIndex = css.indexOf("{", cursor);
    if (openIndex === -1) break;

    const closeIndex = findMatchingBrace(css, openIndex);
    let headerStart = cursor;
    const previousClose = css.lastIndexOf("}", openIndex);
    const previousSemicolon = css.lastIndexOf(";", openIndex);
    headerStart = Math.max(headerStart, previousClose + 1, previousSemicolon + 1);

    const header = css.slice(headerStart, openIndex).trim();
    if (header) {
      blocks.push({
        start: headerStart,
        openIndex,
        closeIndex,
        header,
        body: css.slice(openIndex + 1, closeIndex),
      });
    }

    cursor = closeIndex + 1;
  }

  return blocks;
}

function collectSelectors(css, selectorSet = new Set()) {
  for (const block of parseBlocks(css)) {
    if (block.header.startsWith("@")) {
      collectSelectors(block.body, selectorSet);
      continue;
    }

    for (const selector of splitSelectors(block.header)) {
      selectorSet.add(selector);
    }
  }

  return selectorSet;
}

function pruneCss(css, authoritativeSelectors, stats) {
  const blocks = parseBlocks(css);
  if (blocks.length === 0) return css;

  let result = "";
  let cursor = 0;

  for (const block of blocks) {
    result += css.slice(cursor, block.start);

    if (block.header.startsWith("@")) {
      const prunedBody = pruneCss(block.body, authoritativeSelectors, stats);
      if (prunedBody.trim()) {
        result += `${block.header} {${prunedBody}}`;
      } else {
        stats.emptyAtRules += 1;
      }
    } else {
      const selectors = splitSelectors(block.header);
      const isFullyOwned =
        selectors.length > 0 && selectors.every((selector) => authoritativeSelectors.has(selector));

      if (isFullyOwned) {
        stats.rulesRemoved += 1;
        stats.selectorsRemoved += selectors.length;
        stats.removedSelectors.push(...selectors);
      } else {
        result += css.slice(block.start, block.closeIndex + 1);
      }
    }

    cursor = block.closeIndex + 1;
  }

  result += css.slice(cursor);
  return result;
}

const authoritativeSelectors = new Set();
for (const file of authoritativeFiles) {
  collectSelectors(await readFile(file, "utf8"), authoritativeSelectors);
}

const original = await readFile(appCssPath, "utf8");
const stats = {
  rulesRemoved: 0,
  selectorsRemoved: 0,
  emptyAtRules: 0,
  removedSelectors: [],
};
const pruned = pruneCss(original, authoritativeSelectors, stats)
  .replace(/\n{4,}/g, "\n\n\n")
  .trimStart();

console.log(`Authoritative selectors: ${authoritativeSelectors.size}`);
console.log(`App.css rules removable: ${stats.rulesRemoved}`);
console.log(`App.css selectors removable: ${stats.selectorsRemoved}`);
console.log(`Empty at-rules removable: ${stats.emptyAtRules}`);
console.log(`Size before: ${Buffer.byteLength(original)} bytes`);
console.log(`Size after:  ${Buffer.byteLength(pruned)} bytes`);

if (stats.removedSelectors.length > 0) {
  console.log("\nSelectors selected for removal:");
  for (const selector of [...new Set(stats.removedSelectors)].sort()) {
    console.log(`  ${selector}`);
  }
}

if (shouldWrite) {
  await writeFile(appCssPath, `${pruned.trimEnd()}\n`, "utf8");
  console.log("\nApp.css updated.");
} else {
  console.log("\nDry run only. Re-run with --write to update App.css.");
}
