// @ts-check
import globals from "globals";
const node = globals.node;

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { languageOptions: { globals: node } }
);
