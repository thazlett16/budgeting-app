import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

import { devtools } from '@tanstack/devtools-vite';

import { oxfmtConfig } from '@thaz/oxfmt-config';
import { nativeConfig, routesFileConfig } from '@thaz/oxlint-config';

// Tauri expects a fixed dev server port and needs to ignore src-tauri in its
// file watcher; see https://v2.tauri.app/start/frontend/vite/
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  staged: {
    '*.{js,ts,tsx}': 'vp check --fix',
  },
  run: {
    cache: {
      scripts: false,
      tasks: true,
    },
    tasks: {
      dev: {
        command: 'vp dev',
      },
      build: {
        command: 'vp pack',
      },
      check: {
        command: 'vp check',
      },
      fmt: {
        command: 'vp fmt',
      },
      lint: {
        command: 'vp lint',
      },
      test: {
        command: 'vp test',
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/route-tree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host ?? false,
    ws: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : false,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  fmt: oxfmtConfig,
  lint: {
    extends: [nativeConfig, routesFileConfig],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: ['src/route-tree.gen.ts'],
    // jsPlugins: jsPluginConfig.jsPlugins,
    // rules: {
    //   ...jsPluginConfig.rules,
    // },
  },
  test: {
    setupFiles: ['test/setup.ts'],
    coverage: {
      enabled: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/route-tree.gen.ts', 'src/main.tsx', 'src/routes/**'],
      provider: 'istanbul',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: ['test/**/*.node.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          include: ['test/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ name: 'browser-chromium', browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'types',
          include: ['test/**/*.test-d.ts'],
          typecheck: {
            enabled: true,
          },
        },
      },
    ],
  },
});
