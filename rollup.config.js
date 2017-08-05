// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default {
  entry: 'src/main.ts',
  plugins: [
    typescript({
      // verbosity: 4
    })
  ],
  targets: [
    { dest: 'dist/main.cjs.js', format: 'cjs' },
    { dest: 'dist/main.es.js', format: 'es' },
  ]
}
