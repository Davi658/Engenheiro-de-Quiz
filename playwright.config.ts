import { defineConfig } from '@playwright/test';
export default defineConfig({ timeout: 60000, testDir: './tests/e2e', fullyParallel: true, use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' }, webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI }, reporter: [['list'], ['html', { open: 'never' }]] });
