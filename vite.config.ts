import { defineConfig, loadEnv } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

import { devtools } from '@tanstack/devtools-vite';

import { oxfmtConfig } from '@thaz/oxfmt-config';
import { nativeConfig, routesFileConfig } from '@thaz/oxlint-config';

import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig(({ mode }) => {
  // Tauri expects a fixed dev server port and needs to ignore src-tauri in
  // its file watcher; see https://v2.tauri.app/start/frontend/vite/
  // Empty prefix so `loadEnv` also surfaces plain OS env vars like
  // `TAURI_DEV_HOST` (set by the Tauri CLI), not just `VITE_`-prefixed ones.
  const env = loadEnv(mode, process.cwd(), '');
  const host = env['TAURI_DEV_HOST'];

  return {
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
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        emitTsDeclarations: true,
        emitPrettierIgnore: false,
        // Single-locale for now (English only) — no locale negotiation needed.
        strategy: ['baseLocale'],
      }),
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
      ignorePatterns: ['src/route-tree.gen.ts', 'src/paraglide/**'],
      // jsPlugins: jsPluginConfig.jsPlugins,
      // rules: {
      //   ...jsPluginConfig.rules,
      // },
      overrides: [
        {
          files: ['**/test/**'],

          rules: {
            // This was moved to main config already. I like it in src but it's a pain in tests
            'eslint/no-empty-pattern': 'off',
          },
        },
        {
          files: ['**.config.ts'],

          rules: {
            // I might turn this one off everywhere eventually. Not sure yet. I hate ternaries but also sometimes like below they are nice
            'eslint/no-ternary': 'off',
          },
        },
      ],
    },
    test: {
      setupFiles: ['test/setup.ts'],
      coverage: {
        enabled: true,
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/route-tree.gen.ts', 'src/main.tsx', 'src/routes/**', 'src/paraglide/**'],
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
  };
});
