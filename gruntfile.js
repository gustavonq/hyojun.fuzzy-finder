module.exports = function(grunt) {
	"use strict";

	grunt.initConfig({

		'concat' : {
			'test-amd': {
				'src': ['inc/header.html', 'inc/scripts-amd.html','inc/body.html'],
				'dest' : 'test/index-amd.html'
			},
			'test-almond': {
				'src': ['inc/header.html', 'inc/scripts-almond.html','inc/body.html'],
				'dest' : 'test/index-almond.html'
			},
			'test-pack': {
				'src': ['inc/header.html', 'inc/scripts-concat.html','inc/body.html'],
				'dest' : 'test/index-pack.html'
			},
			'test-css': {
				'src': ['inc/header.html', 'inc/body-test-css.html'],
				'dest' : 'test/index-test-css.html'
			},
			'pack-cache' : {
				'src' : ['dist/js/hyojun.fuzzy-finder-almond.min.js','test/hyojun.fuzzy-finder-plugin.js'],
				'dest' : 'test/hyojun.fuzzy-finder.pack.js'
			}
		},

		'requirejs' : {
			'dist-amd': {
				'options': {
					'optimize' : grunt.option('uglify') || 'uglify2',
					'baseUrl': "js",
					'name': "hyojun.fuzzy-finder/controller",
					'out': "dist/js/hyojun.fuzzy-finder.min.js"
				}
			},
			'dist-almond': {
				'options': {
					'optimize' : grunt.option('uglify') || 'uglify2',
					'baseUrl': "js",
					'include' : ['lib/almond-0.3.1'],
					'name': 'hyojun.fuzzy-finder/controller',
					'out': 'dist/js/hyojun.fuzzy-finder-almond.min.js'
				}
			}
		},

		'sass' : {
			'options': {
				'sourceMap': false
			},
			'dist': {
				'files': {
					'dist/css/hyojun.fuzzy-finder.css' : 'sass/fuzzy-finder.scss'
				}
			}
		},

		'fuzzy-finder-cache' : {
			'bbc-homepage' : {
				'out' : 'test/hyojun.fuzzy-finder-plugin.js',
				'pages' : ['http://www.bbc.com/news/technology'],
				'rules' : {
					'link' : {
						'query' : '.title-link',
						'get' : function($ele, blob){
							blob.c = $ele.text().trim();
							blob.h = $ele.attr('href');
							return blob;
						},
					},
					'template' : {
						'query' : 'script[type="text/template"]',
						'get' : 'id'
					}
				}
			}
		}
	});

	grunt.loadTasks('node_modules/grunt-contrib-requirejs/tasks');
	grunt.loadTasks('node_modules/grunt-contrib-concat/tasks');
	grunt.loadTasks('node_modules/grunt-sass/tasks');
	grunt.loadTasks('node_modules/hyojun.grunt.fuzzy-finder-cache/tasks');

	grunt.registerTask('test', ['requirejs', 'concat']);
	grunt.registerTask('default',['sass', 'fuzzy-finder-cache', 'test']);
};

