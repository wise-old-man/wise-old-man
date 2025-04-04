import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

export default [
  //commonJs
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  // ES Modules
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/es/index.js',
      format: 'es',
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  // ES for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/es/index.mjs',
      format: 'es',
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'cjs' }],
    plugins: [dts()]
  }
];
