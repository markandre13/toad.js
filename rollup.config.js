import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
 
export default {
    input: './src/toad.ts',
    output: {
      name: 'toad',
      file: 'lib/toad.min.js',
      compact: true,
      format: 'umd',
      sourcemap: false
    },
    plugins: [
        typescript({
            "declaration": true,
            "sourceMap": true
        }),
        terser()
    ]
}
