module.exports = function(grunt){

	grunt.registerMultiTask('cache-pages', function(task){

		var request = require('request');
		var ch = require('cheerio');
		var result = [];
		var data = this.data;
		var queue = data.pages || [];
		var host = grunt.option('host') || '';
		var done = this.async();

		function getDna(value){
			var result="", prop;
			for (prop in value) { result += "@"+prop+":"+value[prop]+"@"; }
			return result;
		}

		function hasBlob (blob) {
			if (!blob){
				return false;
			}
			var dna = getDna(blob);
			return result.some(function (value) {
				return dna === getDna(value);
			});
		}

		function addBlob (blob) {
			if((!!blob.c && !!blob.c.length) && hasBlob(blob) === false) {
				result.push(blob);
			}
		}

		function getBlob(){
			return {
				c : null,
				t : null,
				h : null
			};
		}

		function parsePage($, url){
			var rule, fn;
			for (rule in data.rules){
				matcher = data.rules[rule];
				if (typeof matcher.each === 'function'){
					$(matcher.query).each(function(index, ele){
						var blob = getBlob();
						blob.h = url;
						blob.t = rule;
						var content = matcher.each($(ele), blob);
						if (content){
							addBlob(blob);
						}
					});
				} else {
					$(matcher.query).each(function(){
						var blob = getBlob();
						blob.h = url;
						blob.t = rule;
						blob.c = $(this).attr(matcher.get);
						addBlob(blob);
					});
				}
			}
			pickURL();
		}

		function fetchPage (url){

			var u = host+url;

			if (grunt.option('verbose')){
				grunt.log.writeln('fetch\t'+u);
			}

			request(u, function(error, resp, body){
				if (error) {
					grunt.fail.fatal("couldn't open page:" + u);
				}
				if ( !!resp && resp.statusCode !== 200){
					grunt.fail.fatal("couldn't open page " + u + ", status:"+ resp.statusCode);
				} else {
					parsePage(ch.load(body), url);
				}
			});
		}

		function pickURL(){
			if (queue.length===0){
				grunt.log.ok('cache done');
				console.log(result.length+" results found");
				done();
				return;
			}
			var u = queue.shift();
			fetchPage(u);
		}

		pickURL();

	});
};
