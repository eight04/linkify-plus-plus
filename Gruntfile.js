/* eslint-env node */

module.exports = function(grunt) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			grunt: {
				files: ["Gruntfile.js"],
				tasks: ["default"]
			},
			src: {
				files: ["src/*"],
				tasks: ["replace"]
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
			"tlds/raw.txt": "http://ftp.isc.org/www/survey/reports/current/byname.txt"
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-curl');

	// Tasks
	grunt.registerTask("default", ["tlds", "replace"]);
	grunt.registerTask('tlds', ['curl', 'tlds-parse']);
	grunt.registerTask('tlds-parse', "Parse top level domains.", function(){
		var text = grunt.file.read("tlds/raw.txt");
		var lines = text.split(/\r?\n/), line;

		do {
			line = lines.shift();
		} while (!/^TOTAL/.test(line));

		var tlds = {}, total = 0;
		lines.forEach(function(line){
			line = line.trim();
			line = line.split(/\s+/);
			if (!line[0]) {
				return;
			}
			total += tlds[line[0]] = +line[1];
		});

		var key;
		for (key in tlds) {
			tlds[key] = Math.round(tlds[key] * 100 / total);
		}

		// Encode IDN TLDs, collect tld chars matching set.
		var punycode = require("punycode");
		var newKey, charSet = {}, maxLength = 0;

		function addChar(c) {
			if (c.charCodeAt(0) >= 128) {
				charSet[c] = true;
			}
		}

		for (key in tlds) {
			Array.prototype.forEach.call(key, addChar);
			maxLength = key.length > maxLength ? key.length : maxLength;
			if (key.indexOf("xn--") == 0) {
				newKey = punycode.decode(key.substr(4));
				Array.prototype.forEach.call(newKey, addChar);
				newKey = newKey.toLowerCase();
				Array.prototype.forEach.call(newKey, addChar);
				tlds[newKey] = tlds[key];
				maxLength = newKey.length > maxLength ? newKey.length : maxLength;
			}
		}

		grunt.file.write("tlds/set.txt", JSON.stringify(tlds));

		var chars = Object.keys(charSet);
		grunt.file.write("tlds/charSet.txt", chars.sort().join(""));

		grunt.file.write("tlds/maxLength.txt", maxLength);

	});
};
