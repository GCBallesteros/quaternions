/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCAL_DEV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
