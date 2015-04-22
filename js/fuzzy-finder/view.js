define(function(){

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
