define('fuzzy-finder/model',[],function(){

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

define('fuzzy-finder/view',[],function(){

	function dom(tag_name, config, content){
		var ele = document.createElement(tag_name);
		if (!!config && typeof config === 'object') {
			for (var prop in config){
				if (ele[prop]!==undefined){ele[prop] = config[prop]; }
				else {ele.setAttribute(prop, config[prop]); }
			}
		}
		if ('textContent' in ele !== undefined) {
			ele.textContent = (typeof config === 'string') ? config : (content || '');
		}
		return ele;
	}

	function getContentMatch (blob, contentClass) {

		var wrapper = document.createElement('span');
		if (typeof blob === 'string'){
			wrapper = dom('span', { className : contentClass}, blob);
		} else {
			wrapper = document.createDocumentFragment();

			var start = blob.match[0];
			var end = blob.match[1];

			// extract chunks from match to create the view.
			var left = blob.val.substr(0,start);
			var selection = blob.val.substr(start, end);
			var right = blob.val.substr(start+end, blob.val.length);

			if (!!left.length){
				wrapper.appendChild(dom('span',{
						className : contentClass
					},left)
				);
			}
			if (!!selection.length){
				wrapper.appendChild(dom('span',{
						className : 'selection'
					},selection)
				);
			}
			if (!!right.length){
				wrapper.appendChild(dom('span',{
						className : contentClass
					},right)
				);
			}
		}
		return wrapper.children ? wrapper : null;
	}

	function getRow(blob){

		if (typeof blob.c === 'object' || typeof blob.h === 'object'){

			var isURLItem = blob.t === 'url';
			var li = dom('li');
			var a = dom('a',{
				'className' :'item',
				'href': blob.h.val || blob.h,
				'target': '_blank',
				//'data-score' : (blob.score||0).toPrecision(3)
				'data-info': blob.t || ''
			});

			var content = getContentMatch(isURLItem ? blob.h : blob.c, 'content');
			if (!!content){
				li.appendChild(a).appendChild(content);
			}

			if (isURLItem === false){
				var url = getContentMatch(blob.h, 'url');
				if (!!url){
					li.appendChild(a).appendChild(url);
				}
			}
			return li;
		}
		return null;
	}

	function getRenderedList (list) {
		var frag = document.createDocumentFragment();
		list.forEach(function(val){
			var li = getRow(val);
			if (!!li){
				frag.appendChild(li);
			}
		});
		return frag;
	}

	var View = function(holder){
		this.holderEle = holder;
		this.result = [];
	};

	View.prototype = {

		clearResults : function(){
			while(this.holderEle.children.length){
				this.holderEle.children[0].onclick = null;
				this.holderEle.removeChild(this.holderEle.children[0]);
			}
			this.holderEle.scrollTop = 0;
			this.result = [];
			this.selectedItem = null;
		},

		close : function(){
			this.selectedItem = null;
			this.holderEle.className = this.holderEle.className.replace(' active','');
		},

		setSelected : function(index){
			var h = this.holderEle.offsetHeight;
			this.selectedItem = null;
			this.result.forEach(function(ele,i){
				if (i===index){
					this.selectedItem = ele;
					if (this.selectedItem.className.indexOf('hover') === -1){
						this.selectedItem.className += ' hover';
						var iT = this.selectedItem.offsetTop;
						var iH = this.selectedItem.offsetHeight;
						if (iT+iH > h){
							this.holderEle.scrollTop = (iT+iH) - h;
						} else {
							this.holderEle.scrollTop = 0;
						}
					}
				} else {
					ele.className = ele.className.replace(/\shover/gi,'');
				}
			}.bind(this));
		},

		render : function (list) {
			if (!list.length) {
				return;
			}
			var content = getRenderedList(list);
			this.holderEle.appendChild(content);
			this.result = Array.prototype.slice.call(this.holderEle.getElementsByTagName('li'));
			if (!!this.result.length && this.holderEle.className.indexOf('active')===-1){
				this.holderEle.className += ' active';
			}
		}

	};

	return View;
});

define('fuzzy-finder/results-controller',[],function(){

	var NavController = function(view){
		this.view = view;
	};

	NavController.prototype = {

		reset : function(){
			this.selectedIndex = -1;
			this.resultLength = 0;
		},

		refresh : function(){
			this.resultLength = this.view.result.length;
			this.selectedIndex = -1;
		},

		check :function(event){
			//Esc (27) remove and clear the list
			if (event.keyCode === 27) {
				if (this.view.selectedItem){
					this.view.setSelected(-1);
					this.view.holderEle.scrollTop = 0;
					this.refresh();
					event.stopImmediatePropagation();
					return;
				}
			}

			//up and down start nav on results
			if (!!event.keyCode && [38,40].indexOf(event.keyCode) !== -1){
				if(!!this.resultLength){
					this.selectedIndex += event.keyCode===38 ? -1 : 1;
					this.selectedIndex = Math.min(this.selectedIndex, this.resultLength-1);
					this.selectedIndex = Math.max(this.selectedIndex,0);
					this.view.setSelected(this.selectedIndex);
					event.stopImmediatePropagation();
					return;
				}
			}
		},

		openSelected : function(){
			if (this.view && this.view.selectedItem){
				this.view.selectedItem.getElementsByTagName('a')[0].click();
			}
		}
	};

	return NavController;
});


define('fuzzy-finder/controller',[ "fuzzy-finder/model", "fuzzy-finder/view", "fuzzy-finder/results-controller" ], function ( Model, View, NavController) {

	var ctrl = function (input, resultHolder, db ) {
		this.db = db;
		this.inputEle = input;
		this.timeout = 0;
		this.view = new View(resultHolder);
		this.nav = new NavController(this.view);
		this.bindKeyboard();
	};

	ctrl.prototype = {

		bindKeyboard : function(){
			this.inputEle.form.addEventListener('submit', this.checkQuery.bind(this), false);
			this.inputEle.form.addEventListener('submit', this.nav.openSelected.bind(this.nav), false);
			this.inputEle.addEventListener('keyup', this.nav.check.bind(this.nav), false);
			this.inputEle.addEventListener('keyup', this.checkQuery.bind(this), false);
			this.inputEle.form.addEventListener('focusout', this.closeView.bind(this));
		},

		checkQuery : function (event) {

			if (event.type === 'submit'){
				event.preventDefault();
			}

			if (event.keyCode === 27) {
				if (this.nav.resultLength>0){
					this.query = null;
					this.inputEle.value = '';
					this.view.clearResults();
					this.closeView();
					return;
				}
			}

			//shift, command etc
			if (!!event.keyCode && [16,18,93,91,18,17].indexOf(event.keyCode) !== -1){
				return;
			}

			var q = this.inputEle.value;

			//c'mon, at least 2 chars to start searching.
			if (q.length < 3){
				this.closeView();
				return;
			}

			//query changed since last searcy?
			if(q === this.query && !!this.query){
				return;
			}

			this.query = this.inputEle.value;
			var filters = this.query.split(':')||[];
			var term = filters.pop();

			clearTimeout(this.timeout);
			if (!!term && term.length > 2){
				this.timeout = setTimeout(function(){
					this.getResult(term, filters);
				}.bind(this), this.resultLength ? 800 : 500);
			}
		},

		getResult : function(term, filters){

			//getting query timestamp;
			var qt = new Date().getTime();
			var result = Model.regexSuggestions(term, this.db, filters.length ? filters : null);
			qt = new Date().getTime() - qt;

			//getting render timestamp;
			var rt = new Date().getTime();

			if (!!result && !!result.length) {
				this.view.clearResults();
				this.view.render(result);
				this.nav.refresh();
			} else {
				this.nav.reset();
				this.closeView();
			}
			rt = new Date().getTime() - rt;
			this.setQueryStatus('results:' + this.nav.resultLength + '/ query:' + qt + "ms/ render:" + rt+"ms");
		},

		closeView : function(event){
			clearTimeout(this.timeout);
			this.nav.reset();
			this.query = undefined;
			this.setQueryStatus('');
			this.view.clearResults();
			this.view.close();
		},

		setQueryStatus : function(value){
			this.inputEle.form.setAttribute('data-report', value);
		}
	};

	return function(db){
		var inputEle = document.getElementById('fuzzy-query');
		var resultEle = document.getElementById('fuzzy-result');
		if (!!inputEle && !!resultEle && !!db){
			inputEle.plugin = new ctrl(inputEle, resultEle, db);
		} else {
			console.warn('missing dependencies', inputEle, resultEle, db);
		}
	}

});
