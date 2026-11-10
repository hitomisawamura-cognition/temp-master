/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DISPLAY_NAMES?: string;
  readonly VITE_DISPLAY_NAMES_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
