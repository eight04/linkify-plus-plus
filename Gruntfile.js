/* eslint strict: 0 */

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		env: grunt.file.readJSON('env.json'),
		watch: {
			grunt: {
				files: ["Gruntfile.js"]
			},
			src: {
				files: ["*.src.js", "*.css"],
				tasks: ["build"]
			}
		},
		replace: {
			css: {
				options: {
					patterns: [
						{
							match: /'|"/g,
							replacement: "\\$0"
						}
					]
				},
				files: {
					"temp/style.css": "temp/style.css",
					"temp/style-config.css": "temp/style-config.css"
				}
			},
			includeCss: {
				options: {
					patterns: [

					]
				},
				files: {
					"temp/lpp.js": "linkify-plus-plus.src.js"
				}
			},
			includeTlds: {
				options: {
					patterns: [
						{
							json: {
								CSS: "<%= grunt.file.read('temp/style.css') %>",
								TLD_SET: "<%= grunt.file.read('tld-set.txt') %>",
								TLD_CHARS: "<%= grunt.file.read('tld-char-set.txt') %>",
								TLD_LENGTH: "<%= grunt.file.read('tld-max-length.txt') %>"
							}
						}
					],
					prefix: "$REPLACE."
				},
				files: {
					"linkify-plus-plus.user.js": "linkify-plus-plus.src.js"
				}
			}
		},
		clean: ["temp", "tlds"],
		copy: {
			dist: {
				src: "linkify-plus-plus.user.js",
				dest: "<%= env.GM_FOLDER %>\\Linkify_Plus_Plus\\Linkify_Plus_Plus.user.js"
			}
		},
		cssmin: {
			css: {
				expand: true,
				src: "*.css",
				dest: "temp/"
			}
		},
		curl: {
			"tlds.txt": "http://ftp.isc.org/www/survey/reports/current/byname.txt"
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
	grunt.registerTask("default", ["curl", "build"]);
	grunt.registerTask('build', ['tlds-parse', "cssmin", 'replace', 'clean', "copy"]);

	grunt.registerTask('tlds-parse', "Parse top level domains.", function(){
		var text = grunt.file.read("tlds.txt");
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
			charSet[c] = true;
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

		grunt.file.write("tld-set.txt", JSON.stringify(tlds));

		var chars = Object.keys(charSet);
		grunt.file.write("tld-char-set.txt", chars.sort().join(""));

		grunt.file.write("tld-max-length.txt", maxLength);

	});
};
