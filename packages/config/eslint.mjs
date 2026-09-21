import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Config base de ESLint (flat config) compartida por todos los workspaces.
// Cada app la importa desde su propio eslint.config.mjs.
export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/.expo/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
