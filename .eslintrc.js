module.exports = {
	"extends": "eslint:recommended",
	"env": {
		"browser": true,
		"es6": true,
		"greasemonkey": true
	},
	"rules": {
		"no-console": ["error", {"allow": ["warn", "error"]}]
	}
};
