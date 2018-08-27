module.exports = {
	extends: "eslint:recommended",
	env: {
		browser: true,
		es6: true,
    node: true
	},
	rules: {
		"no-console": ["error", {"allow": ["warn", "error"]}]
	},
  parserOptions: {
    ecmaVersion: 2018
  },
  overrides: [
    {
      files: ["rollup.config.js"],
      parserOptions: {
        sourceType: "module"
      }
    }
  ]
};
