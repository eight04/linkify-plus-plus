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
				tasks: ["default"]
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
		clean: ["temp"],
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
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// Tasks
	grunt.registerTask('default', ["cssmin", 'replace', 'clean', "copy"]);
};
