import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: ["dist/**", "dev-dist/**", "node_modules/**", "*.tsbuildinfo", "*.d.ts", "vite.config.*.js", "tailwind.config.*.js"]
  },
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.ts", "scripts/**/*.mjs", "*.config.{js,ts}", "*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly"
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off"
    }
  }
];
