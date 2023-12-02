import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint({
  userConfigs: [
    {
      rules: {
        'vinicunca/cognitive-complexity': 'off',
      },
    },
  ],
});
