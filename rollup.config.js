import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const production = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.ts',
  output: {
    name: 'nep',
    file: 'dist/main.js',
    format: 'umd',
  },
  plugins: [
    resolve({
      module: true,
      browser: true,
    }),
    commonjs(),
    typescript({ cacheRoot: require('unique-temp-dir')() }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    production && uglify({}, minify),
  ],
};
