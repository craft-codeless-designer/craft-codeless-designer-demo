import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

const { visualizer } = require('rollup-plugin-visualizer');
const path = require('path');
const license = require('rollup-plugin-license');

const env = JSON.stringify(process.env.NODE_ENV || 'development');

export default {
  input: './src/index.js',
  output: [
    {
      file: `dist/index.es.${process.env.NODE_ENV === 'production' ? 'min.' : ''}js`,
      format: 'es',
      sourcemap: true,
    },
    {
      file: `dist/index.cjs.${process.env.NODE_ENV === 'production' ? 'min.' : ''}js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `dist/index.umd.${process.env.NODE_ENV === 'production' ? 'min.' : ''}js`,
      format: 'umd',
      sourcemap: true,
    },
  ],
  plugins: [
    json(),
    image(),
    postcss({
      extensions: ['.css', '.scss', '.sass', '.less'],
    }),
    replace({
      exclude: 'node_modules/**',
      ENV: env,
      __DEV__: env === 'development' ? true : false,
      __PROD__: env === 'production' ? true : false,
      preventAssignment: true,
    }),
    nodeResolve({
      browser: true,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
    typescript(),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/env'],
      plugins: [
        [
          '@babel/plugin-proposal-class-properties',
          {
            loose: true,
          },
        ],
      ],
    }),
    process.env.NODE_ENV === 'production' &&
      uglify({
        output: {
          comments: function (node, comment) {
            if (comment.type === 'comment2') {
              // multiline comment
              return /@preserve|@license|@cc_on/i.test(comment.value);
            }
            return false;
          },
        },
      }),
    license({
      sourcemap: true,
      banner: {
        commentStyle: 'regular',
        content: {
          file: path.join(__dirname, 'LICENSE'),
          encoding: 'utf-8',
        },
      },
      thirdParty: {
        allow: '(MIT OR Apache-2.0)',
      },
    }),
    visualizer(),
  ],
  external: ['fabric'],
};
