import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const authFile = path.join(__dirname, '../playwright/.auth/user.json');

/** Skips at run time when no authenticated storage state exists. */
export function requireAuth() {
  test.skip(
    !fs.existsSync(authFile),
    'no authenticated storage state — set E2E_TEST_EMAIL/PASSWORD and run setup first',
  );
}
