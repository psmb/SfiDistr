module.exports = function (grunt) {
	grunt.initConfig({
		watch: {
			compass: {
				files: "scss/**/*.scss",
				tasks: ['compass:dist']
			},
			autoprefixer: {
				files: "Public/Built/app.css",
				tasks: ['autoprefixer:dist']
			},
		},
		bower_concat: {
			all: {
				dest: 'Public/Built/_bower.js',
				cssDest: 'Public/Built/_bower.css',
				mainFiles: {
					'audiojs': 'audiojs/audio.min.js',
					'turbolinks': 'lib/assets/javascripts/turbolinks.js'
				},
				exclude: [
				  'foundation',
				  'modernizr'
				]

			}
		},
		copy: {
			main: {
				expand: true,
				cwd: 'bower_components/slick.js/slick/',
				src: '**',
				dest: 'Public/Built/',
			},
		},
		compass: {
			dist: {
				options: {
					environment: 'development',
					config: "config.rb"
				}
			}

		},

		autoprefixer: {
			dist: {
				options: {
					browsers: ['last 2 version', '> 1%', 'ie 9']
				},
				src: 'Public/Built/app.css',
				dest: 'Public/Built/app-prefixed.css'
			}
		}
	//	browserSync: {
	//		dev: {
	//			bsFiles: {
	//				src : 'Public/Built/app.css'
	//			},
	//			options: {
	//				proxy: "dev.typo3-app:8080",
	//				watchTask: true,
	//				hostname: '0.0.0.0'
	//			}
	//		}
	//	}
	});

	// load npm tasks
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-autoprefixer');
//	grunt.loadNpmTasks('grunt-browser-sync');

	// create custom task-list
	grunt.registerTask('default', ["watch"]);
	//grunt.registerTask('autoprefixer', ["autoprefixer"]);
};
