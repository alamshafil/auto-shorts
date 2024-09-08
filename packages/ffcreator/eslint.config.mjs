import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["public/*", "docs/*", "test/*", "node_modules/*"],
}, ...compat.extends("eslint:recommended"), {
    plugins: {},

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
            global: true,
        },

        ecmaVersion: 2018,
        sourceType: "module",
    },

    rules: {
        "no-useless-escape": 0,
        "no-empty": 0,
    },
}];
