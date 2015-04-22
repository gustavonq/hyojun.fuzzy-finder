module.exports = function(grunt) {
	"use strict";

	grunt.initConfig({

		'requirejs' : {
			compile: {
				options: {
					optimize : 'none',
					baseUrl: "js",
					name: "fuzzy-finder/controller",
					out: "dist/js/fuzzy-finder.js"
				}
			}
		},

		'cache-pages' : {
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

	grunt.loadTasks('tasks');
	grunt.loadTasks('node_modules/grunt-contrib-requirejs/tasks');
	//grunt.registerTask('default',['requirejs']);
	grunt.registerTask('default',['requirejs','cache-pages']);
};

