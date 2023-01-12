// rollup.config.js
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist.js',
      format: 'umd',
      name: 'awsLib'
    },
    {
      file: 'dist.min.js',
      format: 'umd',
      name: 'awsLib',
      plugins: [terser()]
    }
  ],
  plugins: [json()]
};