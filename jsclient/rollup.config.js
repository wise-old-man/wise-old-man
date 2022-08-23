import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      external: ['axios', 'dayjs', 'lodash'],
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
  // {
  //   input: 'src/index.ts',
  //   output: [{ file: 'dist/index.d.ts', format: 'es' }],
  //   plugins: [
  //     dts({ respectExternal: true }),
  //     resolve({
  //       resolveOnly: ['.prisma/client']
  //     })
  //   ]
  // }
];
