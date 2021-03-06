define([ "hyojun.fuzzy-finder/model", "hyojun.fuzzy-finder/view", "hyojun.fuzzy-finder/results-controller" ], function ( Model, View, NavController) {

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



		closeView : function(event) {
			if (!!event){
				if ((!!event.relatedTarget && event.relatedTarget.tagName.toLowerCase() === 'a') || 
					(document.activeElement.tagName.toLowerCase() === 'a')){
					event.preventDefault();
					return;
				} 
			}

			clearTimeout(this.timeout);
			this.nav.reset();
			this.query = undefined;
			this.setQueryStatus('');
			this.view.clearResults();
			this.view.close();
			if (!!event){
				event.preventDefault();
			}
		},

		setQueryStatus : function(value){
			this.inputEle.form.setAttribute('data-report', value);
		}
	};

	return function(db){
		var inputEle = document.getElementById('gl-fuzzy-query');
		var resultEle = document.getElementById('gl-fuzzy-result');
		if (!!inputEle && !!resultEle && !!db){
			inputEle.plugin = new ctrl(inputEle, resultEle, db);
		} else {
			console.warn('missing dependencies', inputEle, resultEle, db);
		}
	}

});
