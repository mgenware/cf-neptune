import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

const production = process.env.NODE_ENV === 'production';

export default {
  input: 'lib/main.ts',
  output: {
    name: 'nep',
    file: 'dist/main.js',
    format: 'iife',
  },
  plugins: [
    resolve({
      module: true,
      browser: true,
    }),
    commonjs(),
    typescript({ cacheRoot: (require('unique-temp-dir'))() }),
    production && uglify(),
  ],
};
