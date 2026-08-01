import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = new Set(process.argv.slice(2)).has("--write");

const targets = new Map([
  [
    "src/App.css",
    new Set([".scenario-results-grid"]),
  ],
  [
    "src/styles/layouts/drawdown-controls.css",
    new Set([
      ".chart-tabs",
      ".chart-tab",
      ".chart-tab-active",
      ".chart-tab:focus-visible",
      ".projection-segmented-control",
      ".projection-segmented-control button",
      ".projection-segmented-control button:focus-visible",
      ".projection-segmented-control button.is-active",
    ]),
  ],
  [
    "src/styles/layouts/drawdown-page.css",
    new Set([".drawdown-chart"]),
  ],
  [
    "src/styles/retirement-dashboard.css",
    new Set([
      ".comparison-assumptions-panel",
      ".comparison-goal-difference.negative",
      ".comparison-goal-difference.positive",
      ".comparison-goal-grid",
      ".comparison-goal-progress",
      ".comparison-impact-heading",
      ".comparison-impact-heading h2",
      ".comparison-table-scroll",
      ".comparison-text-button",
      ".retirement-chart-workspace",
    ]),
  ],
]);

function normaliseSelector(selector) {
  return selector.replace(/\s+/g, " ").trim();
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
    const previousClose = css.lastIndexOf("}", openIndex);
    const previousSemicolon = css.lastIndexOf(";", openIndex);
    const start = Math.max(cursor, previousClose + 1, previousSemicolon + 1);
    const header = css.slice(start, openIndex).trim();
    if (header) blocks.push({ start, openIndex, closeIndex, header });
    cursor = closeIndex + 1;
  }
  return blocks;
}

function prune(css, removals, stats) {
  const blocks = parseBlocks(css);
  if (blocks.length === 0) return css;

  let result = "";
  let cursor = 0;
  for (const block of blocks) {
    result += css.slice(cursor, block.start);
    const body = css.slice(block.openIndex + 1, block.closeIndex);

    if (block.header.startsWith("@")) {
      const prunedBody = prune(body, removals, stats);
      if (prunedBody.trim()) result += `${block.header} {${prunedBody}}`;
      else stats.emptyAtRules += 1;
    } else {
      const selectors = splitSelectors(block.header);
      const kept = selectors.filter((selector) => !removals.has(selector));
      const removed = selectors.filter((selector) => removals.has(selector));

      if (removed.length > 0) {
        stats.selectorsRemoved += removed.length;
        stats.removedSelectors.push(...removed);
      }

      if (kept.length === 0) {
        if (removed.length > 0) stats.rulesRemoved += 1;
        else result += css.slice(block.start, block.closeIndex + 1);
      } else if (removed.length > 0) {
        stats.rulesSplit += 1;
        result += `${kept.join(",\n")} {${body}}`;
      } else {
        result += css.slice(block.start, block.closeIndex + 1);
      }
    }

    cursor = block.closeIndex + 1;
  }

  return result + css.slice(cursor);
}

for (const [relativePath, removals] of targets) {
  const filePath = path.join(root, relativePath);
  const original = await readFile(filePath, "utf8");
  const stats = {
    rulesRemoved: 0,
    rulesSplit: 0,
    selectorsRemoved: 0,
    emptyAtRules: 0,
    removedSelectors: [],
  };
  const updated = prune(original, removals, stats)
    .replace(/\n{4,}/g, "\n\n\n")
    .trimStart();

  console.log(`\n${relativePath}`);
  console.log(`  rules removed: ${stats.rulesRemoved}`);
  console.log(`  mixed rules split: ${stats.rulesSplit}`);
  console.log(`  selectors removed: ${stats.selectorsRemoved}`);
  console.log(`  empty at-rules removed: ${stats.emptyAtRules}`);
  for (const selector of [...new Set(stats.removedSelectors)].sort()) {
    console.log(`    ${selector}`);
  }

  if (shouldWrite && updated !== original) {
    await writeFile(filePath, `${updated.trimEnd()}\n`, "utf8");
    console.log("  updated");
  }
}

if (!shouldWrite) {
  console.log("\nDry run only. Re-run with --write to update the files.");
}
