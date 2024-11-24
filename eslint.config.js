import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

const targetFiles = { files: ["**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx}"] };
const ignores = { ignores: ["**/dist/**"] };

const plugins = {
  plugins: {
    "@typescript-eslint": typescriptEslint,
  },
};

const recommendedRules = {
  rules: {
    ...typescriptEslint.configs.recommended.rules, // TypeScript の推奨ルール
    ...typescriptEslint.configs["recommended-type-checked"].rules, // TypeScript の推奨ルール（型チェックあり）
    ...typescriptEslint.configs.strict.rules, // 厳格なルール
    ...typescriptEslint.configs["strict-type-checked"].rules, // 厳格なルール（型チェックあり）
    ...typescriptEslint.configs.stylistic.rules, // スタイルに関するルール
  },
};

const individualRules = {
  rules: {},
};

export default [
  targetFiles,
  ignores,
  js.configs.recommended,
  plugins,
  recommendedRules,
  individualRules,
];
