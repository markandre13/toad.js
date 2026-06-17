//
// npm packages should contain *.js files
// 

import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { globSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dts from 'unplugin-dts/vite'

const allSourceFiles = globSync(["src/**/*.{ts,tsx}"])
const allSourceFilesAsObject = Object.fromEntries(allSourceFiles.map((filename) => {
    // src/viewkit/TextField.ts -> viewkit/TextField
    const shortPath = filename.slice(4, filename.length - path.extname(filename).length)
    // src/viewkit/TextField.ts -> $(pwd)/src/viewkit/TextField.ts
    const absolutePath = fileURLToPath(new URL(filename, import.meta.url))
    return [shortPath, absolutePath]
}))

export default defineConfig({
    plugins: [
        // dts: a plugin to create *.d.ts files
        dts({
            include: allSourceFiles,
            outDirs: ["dist"],
            entryRoot: "src",
            insertTypesEntry: false,
            tsconfigPath: "tsconfig.json",
            compilerOptions: {
                rootDir: path.resolve("src")
            }
        })
    ],
    resolve: {
        alias: {
            "@toad": "/src",
            "src": "/src",
            "spec": "/spec",
        },
    },
    server: { port: 3000 },
    optimizeDeps: {
        include: [],
        noDiscovery: true
    },
    build: {
        target: 'esnext',
        sourcemap: true,
        lib: {
            formats: ['es'],
            entry: allSourceFiles
        },
        rolldownOptions: {
            external: ['toad.jsx'],
            input: allSourceFilesAsObject,
            output: {
                minify: false,
                exports: "auto",
                generatedCode: {
                    preset: 'es5',
                    symbols: false
                },
            }
        },
    },
    test: {
        include: ["spec/**/*.spec.{ts,tsx}"],
        browser: {
            provider: playwright(),
            enabled: true,
            instances: [
                { browser: 'chromium', headless: true },
            ],
        },
        reporters: [
            ['tree', { summary: false }]
        ]
    },
})