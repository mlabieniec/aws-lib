// rollup.config.js
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist.js',
      format: 'es',
      name: 'awsLib'
    },
    {
      file: 'dist.min.js',
      format: 'es',
      name: 'awsLib',
      plugins: [terser()]
    }
  ],
  plugins: [json()]
};