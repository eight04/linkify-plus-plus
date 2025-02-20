import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist", "dist-extension"]
  },
  js.configs.recommended,
  {
    "rules": {
      "dot-notation": 2,
      "max-statements-per-line": 2,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
];
