declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * Set by `tauri dev` when running against a physical device/emulator so
     * the Vite dev server binds to a reachable host instead of localhost;
     * see https://v2.tauri.app/start/frontend/vite/
     */
    TAURI_DEV_HOST?: string | undefined;
  }
}

// interface ImportMetaEnv {
// }
//
// interface ImportMeta {
//   readonly env: ImportMetaEnv;
// }
