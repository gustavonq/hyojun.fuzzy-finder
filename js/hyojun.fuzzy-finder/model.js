define(function(){

	function levenstainTest(a, b){
		if(a.length === 0){
		 	return b.length;
		}
		if(b.length === 0){
			return a.length;
		}

		var i, j,alen, blen, matrix = [];

		alen = a.length;
		blen = b.length;
		// increment along the first column of each row
		for(i = 0; i <= blen; i++){
			matrix[i] = [i];
		}

		// increment each column in the first row
		for(j = 0; j <= alen; j++){
			matrix[0][j] = j;
		}

		// Fill in the rest of the matrix
		for(i = 1; i <= blen; i++){
			for(j = 1; j <= alen; j++){
				if(b.charAt(i-1) === a.charAt(j-1)){
					matrix[i][j] = matrix[i-1][j-1];
				} else {
					matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
					Math.min(matrix[i][j-1] + 1, // insertion
					matrix[i-1][j] + 1)); // deletion
				}
			}
		}
		return matrix[blen][alen];
	}

	function containsBlob(value, list){
		return list.some(function(blob){
			return value.uid === blob.uid;
		});
	}

	function getUID(blob){
		var str = "", prop;
		for (prop in blob) {
			str += prop + ":" + (!!blob[prop] && typeof blob[prop] === "object" ? blob[prop].val : blob[prop]) + "^";
		}
		return str;
	}

	return {

		regexSuggestions : function(query, db, filters){

			var prop = 'c';
			if (query.match(/^url\!/)){
				prop = 'h';
				query = query.replace(/^url\!/,'');
				if (!query.length){
					return null;
				}
			}

			var reg;
			var result = [];
			try {
				reg = new RegExp(query.split('').join('.*?'), 'mgi');
			} catch(err){
				console.warn('malformed query: ',err);
				reg = null;
			}

			function testBlob(blob){

				var	match = blob[prop].indexOf(query);
				var val;
				var score;
				if (match !== -1){
					match = [query];
					score = 1;
				} else if(reg) {
					match = blob[prop].match(reg);
				}

				if (!!match && typeof match[0] === 'string' ){

					val = match[0].toLowerCase();
					score = score || query.length / val.length;

					if (score<0.5){
						//way tooo different from query
						//console.log(score, query, val, query.length, val.length);
						return;
					}

					var matchingBlob = {};
					var blobVal, index;

					if (prop === 'h'){ //for url result a simple blob is enough

						blobVal = blob.h;

						//where selection starts
						index = blobVal.toLowerCase().indexOf(val);

						//to be rendered as url (different view)
						matchingBlob.t = 'url';
						matchingBlob.h = {
							val : blobVal,
							match : [index, val.length]
						};

					} else { //normal blob. clone all props and set selection on match

						var eachProp;

						//shallow clone to preserve original blob
						for(eachProp in blob){

							blobVal = blob[eachProp];

							//apply selection index
							if (prop === eachProp){

								//where selection starts
								index = blobVal.toLowerCase().indexOf(val);
								matchingBlob[eachProp] = {
									val : blobVal,
									match : [index, val.length]
								};

							} else {
								matchingBlob[eachProp] = blob[eachProp];
							}
						}
					}

					//setting uid to avoid adding twice same targets.
					matchingBlob.uid = getUID(matchingBlob);
					matchingBlob.score = score;
					if (!containsBlob(matchingBlob, result)){
						result.push(matchingBlob);
					}
				}
			}

			db.map(function (value){
				if (!filters || filters.indexOf(value.t) !== -1){
					testBlob(value);
				}
			});

			//return results filtered by score relevancy
			return result.sort(function (a,b) {
				if (a.score > b.score){return -1;}
				else if (a.score< b.score){return 1;}
				return 0;
			});
		},

		levenstainSuggestions : function(query, db, filters){
			/*
					var obj, fuzzyness, foundList, index,
							edistance, score, wlength, length,
							clearList = [];

					fuzzyness = 0.3;

					foundList = [];
					index = 0;
					length = db.length;

					do {
						obj = db[index++];
						if (!!obj.href){
							edistance = levenstainTest(word, obj.href);
							length = Math.max(word.length, obj.href.length);
							obj.score = 1 - edistance/length;

							if (obj.score > fuzzyness){
								//console.log(obj.href);
								//console.log('edistance',edistance);
								//console.log('length',length);
								//console.log('obj.score ',obj.score );
								//console.error('------');
								foundList.push(obj);
							}
						}

					} while (index < length);


					function compare(a,b) {
						if (a.score < b.score)
							return -1;
						if (a.score > b.score)
							return 1;
						return 0;
					}

					foundList.sort(compare);

					foundList.forEach(function(item){
						clearList.push(JSON.stringify(item))
					})
					clearList.reverse();
					return clearList;

			*/
			return [];
		}
	};
});
