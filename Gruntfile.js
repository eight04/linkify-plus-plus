/* eslint strict: 0 */

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		env: grunt.file.readJSON('env.json'),
		watch: {
			grunt: {
				files: "Gruntfile.js"
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
						{
							match: "CSS",
							replacement: "<%= grunt.file.read('temp/style.css') %>"
						},
						{
							match: "CSS_CONFIG",
							replacement: "<%= grunt.file.read('temp/style-config.css') %>"
						}
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
							match: "TLDS",
							replacement: "<%= grunt.file.read('tlds') %>"
						}
					],
					prefix: "// @@"
				},
				files: {
					"linkify-plus-plus.user.js": "temp/lpp.js"
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
			total += tlds[line[0].toUpperCase()] = +line[1];
		});

		var key;
		for (key in tlds) {
			tlds[key] = Math.round(tlds[key] * 100 / total);
		}

		var str = JSON.stringify(tlds);

		grunt.file.write("tlds", str.substring(1, str.length - 1));
	});
};
