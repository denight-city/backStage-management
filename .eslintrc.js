module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 0,
    'no-unused-vars': 'off',
    'comma-dangle': 0,
    indent: [0, 2],
    'space-in-parens': 0,
    'no-trailing-spaces': 0,
    'padded-blocks': 0,
    semi: 0

  }
}
