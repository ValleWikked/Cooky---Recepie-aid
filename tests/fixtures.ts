import { test as base, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const VENDOR_ROOT = path.resolve(__dirname, '..', 'node_modules');

/**
 * CDN URL → local file mapping.
 * Allows tests to run in offline / network-restricted environments by
 * redirecting the app's CDN script tags to locally installed npm packages.
 */
const CDN_ROUTES: Record<string, string> = {
  'https://unpkg.com/react@18/umd/react.production.min.js':
    path.join(VENDOR_ROOT, 'react', 'umd', 'react.production.min.js'),
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js':
    path.join(VENDOR_ROOT, 'react-dom', 'umd', 'react-dom.production.min.js'),
  'https://unpkg.com/@babel/standalone/babel.min.js':
    path.join(VENDOR_ROOT, '@babel', 'standalone', 'babel.min.js'),
};

export const test = base.extend({
  page: async ({ page }, use) => {
    for (const [url, localPath] of Object.entries(CDN_ROUTES)) {
      await page.route(url, (route) => {
        const body = fs.readFileSync(localPath);
        route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body,
        });
      });
    }
    await use(page);
  },
});

export { expect };
