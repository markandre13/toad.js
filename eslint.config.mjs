// @ts-check

import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig({
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
        // this is an error i care about as it can lead to runtime errors
        // and typescript's verbatimModuleSyntax options does not detect it
        // for classes as needed.
        //
        // but eslint gives false positive as is expects
        //    import type { X }
        // and does not recognize
        //    import { type X }
        "@typescript-eslint/consistent-type-imports": "off",

        // and these are errors i do not care about at the moment
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "prefer-const": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "no-useless-assignment": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",
        "no-useless-escape": "off",
        "no-useless-catch": "off",
        "no-empty": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "no-case-declarations": "off",
        "no-var": "off",
        "@typescript-eslint/no-wrapper-object-types": "off",
        // "": "off",      
    }
})