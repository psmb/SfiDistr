module.exports = function (grunt) {
	grunt.initConfig({
		watch: {
			compass: {
				files: "scss/**/*.scss",
				tasks: ['compass:watch'],
				debugInfo : true,
				trace: true
			},
		},
		bower_concat: {
			all: {
				dest: 'Public/Built/_bower.js',
				cssDest: 'Public/Built/_bower.css',
				mainFiles: {
					'audiojs': 'audiojs/audio.min.js'
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
			watch: {
				options: {
					watch: true,
					environment: 'development',
					config: "config.rb"
				}
			},
			compile: {
                                options: {
                                        environment: 'development',
                                        config: "config.rb"
                                }
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
//	grunt.loadNpmTasks('grunt-browser-sync');

	// create custom task-list
	grunt.registerTask('default', ["compass"]);
};
