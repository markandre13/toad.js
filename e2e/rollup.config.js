import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
 
export default {
    input: 'e2e/main.ts',
    output: {
      name: 'e2e',
      file: 'build/e2e/main.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    declaration: false
                },    
                include: [ "e2e/**/*.code.ts", "lib" ],
                exclude: [ "e2e/**/*.spec.ts", "docs", "src", "test" ]
            },
        }),
        nodeResolve(),
        terser()
    ]
}
