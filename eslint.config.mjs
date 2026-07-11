import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { globals: globals.browser },
    // 👇 ここから下に「コピペミス監視ルール」を追加しました
    rules: {
      "no-dupe-keys": "error",          // 同じ名前のデータが2回出てきたら赤波線
      "no-duplicate-imports": "error",   // 同じファイルの読み込みが2回出てきたら赤波線
      "no-irregular-whitespace": "error" // 全角スペースなどの目に見えないゴミを検知
    }
  },
]);
