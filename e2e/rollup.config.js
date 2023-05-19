import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
 
export default {
    input: 'e2e/main.ts',
    output: {
      name: 'e2e',
      file: 'e2e/main.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    outDir: "e2e"
                },
                include: [ "e2e/**/*.code.ts", "lib" ],
                exclude: [ "src", "test" ]
            },
        }),
        nodeResolve(),
        terser()
    ]
}
