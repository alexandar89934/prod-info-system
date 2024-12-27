module.exports = {
  env: {
    browser: true,
    es2021: true,
    es6: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ["*.js", "*.ts", "*.tsx"],
      rules: {
        "no-param-reassign": [
          "error",
          { props: true, ignorePropertyModificationsFor: ["state"] }
        ],
        "eslint-config-stylish": "off",
        "import/order": ["error", {
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }]
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
  },
  plugins: ['@typescript-eslint', 'react', 'prettier'],
  rules: {
    "import/no-extraneous-dependencies": "off",
    "react/function-component-definition": "off",
    "react/react-in-jsx-scope": 0,
    "react/require-default-props": "off",
    "import/order": "off",
    "import/no-self-import": "off",
    "import/extensions": "off",
    "import/no-duplicates": "off",
    "import/no-cycle": "off",
    "import/no-relative-packages": "off",
    "import/no-named-as-default": "off",
    "import/no-useless-path-segments": "off",
    "import/no-default-export": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "react/button-has-type": "off",
    "prefer-arrow-callback": ["error", { "allowNamedFunctions": false }],
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "react/jsx-props-no-spreading": "off",
    "no-param-reassign": "off"
  },
};
