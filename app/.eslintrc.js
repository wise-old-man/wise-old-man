module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier'],
  plugins: ['react', 'jsx-a11y', 'import'],
  env: {
    browser: true
  },
  rules: {
    'no-use-before-define': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': [2, { ignore: ['children'] }],
    'jsx-a11y/control-has-associated-label': 'off'
  }
};
