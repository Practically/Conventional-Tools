/** @type {import('eslint').Linter.Config} */
module.exports = {
    env: { node: true, es6: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      project: ["./tsconfig.json", "./tsconfig.eslint.json"],
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/stylistic-type-checked",
      "plugin:prettier/recommended",
    ],
    plugins: ["prettier", "simple-import-sort"],
    settings: {
      jsdoc: { mode: "typescript" },
      react: { version: "detect" },
    },
    rules: {
      // Sort all of the imports so its node and clean when reviewing diffs
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Because we are using react 18 and its new tsx compiler we don't need to
      // have react in scope
      "react/react-in-jsx-scope": "off",
      // This will all be done with typescript checking
      "react/prop-types": "off",
      // This should not be need but sometimes its a necessary evil
      "@typescript-eslint/no-explicit-any": "off",
      // This is causing a crash when trying to link typescript files
      "@typescript-eslint/no-empty-function": "off",
      // We want to import types with the type keyword when possible
      "@typescript-eslint/consistent-type-imports": "error",
    },
  };