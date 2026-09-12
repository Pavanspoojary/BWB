/**
 * Lightweight frontmatter and markdown section extractor for tests.
 */

import { readFileSync, existsSync } from 'node:fs';

export function parseMarkdownFrontmatter(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  const content = readFileSync(filePath, 'utf-8');
  return parseMarkdownString(content);
}

export function parseMarkdownString(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  const rawYaml = match[1];
  const body = match[2];
  const frontmatter = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item: - "value" or - value
    if (trimmed.startsWith('- ') && currentArray) {
      const val = trimmed.slice(2).trim().replace(/^['"](.*)['"]$/, '$1');
      currentArray.push(val);
      continue;
    }

    // Key-value pair: key: value
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();

      if (val === '' || val === '[]') {
        currentKey = key;
        currentArray = [];
        frontmatter[key] = currentArray;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        // Inline array: ["item1", "item2"]
        const items = val
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'))
          .filter(Boolean);
        frontmatter[key] = items;
        currentArray = null;
      } else {
        currentArray = null;
        if (val === 'true') frontmatter[key] = true;
        else if (val === 'false') frontmatter[key] = false;
        else if (!isNaN(Number(val)) && val !== '') frontmatter[key] = Number(val);
        else frontmatter[key] = val.replace(/^['"](.*)['"]$/, '$1');
      }
    }
  }

  return { frontmatter, body };
}
