const config = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    // type checking
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["tsconfig.eslint.json"],
  },
  // prettier must come at the last of this list
  plugins: ["react", "@typescript-eslint", "prettier"],
  rules: {
    // Since React 17 and typescript 4.1, no need to add React in scope
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/ban-types": "warn",
    "no-empty-pattern": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "react/prop-types": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    ".eslintrc.js",
    "electron-builder.config.js",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
  ],
};

module.exports = config;
