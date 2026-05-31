import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'vite.config.ts', 'tailwind.config.ts', 'src/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
