import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
 
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
            "useTsconfigDeclarationDir": true,
        }),
        // terser()
    ]
}
