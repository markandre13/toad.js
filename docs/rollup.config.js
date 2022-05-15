import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
 
export default {
    input: 'docs/main.ts',
    output: {
      name: 'example',
      file: 'docs/main.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    outDir: "docs"
                },
                include: [ "docs", "lib" ],
                exclude: [ "src", "test" ]
            },
        }),
        nodeResolve(),
        terser()
    ]
}
