/* eslint-env node */

module.exports = function(grunt) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			target: ["src/*.js"]
		},
		watch: {
			grunt: {
				files: ["Gruntfile.js"],
				tasks: ["default"]
			},
			src: {
				files: ["src/*"],
				tasks: ["eslint", "replace"]
			}
		},
		replace: {
			js: {
				options: {
					patterns: [{
						match: /TLDS\.(\w+)/g,
						replacement: function(match, name) {
							return grunt.file.read("tlds/" + name + ".txt");
						}
					}],
					usePrefix: false
				},
				files: {
					"dist/linkify-plus-plus.user.js": "src/linkify-plus-plus.user.js"
				}
			}
		},
		curl: {
			"tlds/raw.txt": "http://data.iana.org/TLD/tlds-alpha-by-domain.txt"
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-curl');

	// Tasks
	grunt.registerTask("default", ["tlds", "replace"]);
	grunt.registerTask('tlds', ['curl', 'tlds-parse']);
	grunt.registerTask('tlds-parse', "Parse top level domains.", function(){
		// Parse raw data
		var raw = grunt.file.read("tlds/raw.txt"),
			tlds = raw.match(/^[\w-]+$/gm).map(function(tld){
				return tld.toLowerCase();
			});

		// Decode punycode
		var punycode = require("punycode");
		tlds = tlds.concat(tlds.filter(function(tld){
			return tld.lastIndexOf("xn--", 0) == 0;
		}).map(function(tld){
			return punycode.decode(tld.substr(4));
		}));

		// Get max length
		var maxLength = tlds.reduce(function(len, tld){
			return len > tld.length ? len : tld.length;
		}, 0);

		// Collect unicode character set
		var charSet = {};
		tlds.forEach(function(tld){
			Array.prototype.forEach.call(tld, function(char){
				if (char.charCodeAt(0) >= 128) {
					charSet[char] = true;
				}
			});
		});

		// Create tld set
		var tldSet = {};
		tlds.forEach(function(tld){
			tldSet[tld] = true;
		});

		grunt.file.write("tlds/set.txt", JSON.stringify(tldSet));

		grunt.file.write("tlds/charSet.txt", Object.keys(charSet).join(""));

		grunt.file.write("tlds/maxLength.txt", maxLength);

	});
};
