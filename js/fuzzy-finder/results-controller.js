define(function(){

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

