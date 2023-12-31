import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: [
    'src/index',
  ],
  externals: [
    '@typescript-eslint/utils',
  ],
  rollup: {
    emitCJS: true,
  },
});
