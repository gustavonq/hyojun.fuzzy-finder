module.exports = function(grunt) {
	"use strict";

	grunt.initConfig({

		'requirejs' : {
			'dev': {
				'options': {
					'optimize' : 'none',
					'baseUrl': "js",
					'name': "fuzzy-finder/controller",
					'out': "dist/js/fuzzy-finder.min.js"
				}
			},
			'dist-amd': {
				'options': {
					'baseUrl': "js",
					'name': "fuzzy-finder/controller",
					'out': "dist/js/fuzzy-finder.min.js"
				}
			},
			'dist-almond': {
				'options': {
					'baseUrl': "js",
					'include' : ['lib/almond-0.3.1'],
					'name': "fuzzy-finder/controller",
					'out': "dist/js/fuzzy-finder-almond.min.js"
				}
			}
		},

		"sass" : {
			"options": {
				"sourceMap": false
			},
			"dist": {
				"files": {
					"dist/css/fuzzy-finder.css" : "sass/fuzzy-finder.scss"
				}
			}
		},

		'fuzzy-finder-cache' : {
			'guideline' : {
				'out' : 'test/fuzzy-finder-plugin.js',
				'pages' : ['guideline/guideline-pages/listas.jsp', 'guideline/mockup/troque.jsp'],
				'rules' : {
					'link' : {
						'query' : ".gl-header, .gl-mockup-link, h3.gl, h4.gl, h5.gl, h6.gl",
						'get' : function($ele, blob){
							var id = $ele.attr("id");

							if ($ele.get().name === 'a'){
								blob.h = $ele.attr('href');
							} else if (!!id && id.length){
								blob.h = blob.h + "#" + id;
							}

							blob.c = $ele.text().replace(/[\n|\t]/,"");
							return blob;
						}
					},
					'template' : {
						'query' : 'script[type="text/x-mustache-template"]',
						'get' : 'id'
					},
					'data-service' : {
						'query' : '[data-service]',
						'get' : 'data-service'
					},
					'data-plugin' : {
						'query' : '[data-plugin]',
						'get' : 'data-plugin'
					}
				}
			}
		}
	});

	grunt.loadTasks('node_modules/grunt-contrib-requirejs/tasks');
	grunt.loadTasks('node_modules/grunt-sass/tasks');
	grunt.loadTasks('node_modules/hyojun.grunt.fuzzy-finder-cache/tasks');
	grunt.registerTask('default',['sass', 'requirejs:dist-amd', 'requirejs:dist-almond', 'fuzzy-finder-cache']);
};

