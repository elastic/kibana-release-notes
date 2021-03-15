/* eslint-disable prettier/prettier */

module.exports = {
  plugins: ['jest'],
  extends: [
    'react-app',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    eqeqeq: 'error',
    'no-duplicate-imports': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.{tsx,ts}'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        'no-duplicate-imports': 'off',
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
          },
        ]
      }
    }
  ]
};