import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
 
export default {
    input: 'src/toad.ts',
    output: {
      name: 'toad',
      format: 'umd',
      file: 'lib/toad.js',
      sourcemap: true
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                    outDir: "lib",
                    declarationDir: "lib",
                },
                include: [ "src" ]
            },
            "useTsconfigDeclarationDir": false,
        }),
        nodeResolve(),
        commonjs(),
        // terser()
    ]
}
