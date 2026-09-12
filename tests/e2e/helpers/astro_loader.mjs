
import { pathToFileURL } from 'node:url';
import { resolve as pathResolve } from 'node:path';

const shimUrl = pathToFileURL(pathResolve('./tests/e2e/helpers/astro_shim.mjs')).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'astro:content') {
    return {
      format: 'module',
      shortCircuit: true,
      url: shimUrl
    };
  }
  return nextResolve(specifier, context);
}
