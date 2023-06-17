import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
 
export default {
    input: 'docs/main.tsx',
    output: {
      name: 'example',
    //   dir: 'dist/docs',
      file: 'dist/docs/main.js',
      inlineDynamicImports: true,
      format: 'es',
      sourcemap: false,
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    declaration: false
                },
                include: [ "docs", "lib" ],
                exclude: [ "src", "test" ]
            },
        }),
        nodeResolve(),
        terser()
    ]
}
