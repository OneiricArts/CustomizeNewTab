var debug = false;
if(debug){console.log('myScript running ...');}

$( document ).ready(function() {
   var obj = new pageHandeler();
   obj.init();
});


/*
	pageHandeler Object 
*/
function pageHandeler() {
	Base.call(this);
	this.datakey = 'pageHndler_widgets';
	this.$myCols;

	this.NFL = new NFL();
	this.NBA = new NBA();
	this.Links = new Links();

	this.widgetKeys = ['NFL', 'NBA', 'Links'];
};

pageHandeler.prototype = Object.create(Base.prototype); // See note below
pageHandeler.prototype.constructor = pageHandeler;

pageHandeler.prototype.init = function(){

	this.loadData(this.loadWidgets, this.setDefaults);

	//this.$myCols = $('.row');
	var that = this;
	$('#page_options button').on('click', {that: that}, triggerWidget);
	//$('body').on('click', $('#page_options button'), triggerWidget);
};

pageHandeler.prototype.loadWidgets = function(){
	
	for(var i = 0; i < this.widgetKeys.length; i++) {

		key = this.widgetKeys[i];

		if( (key in this.data) && (this.data[key] == true) && (key in this) ) {
			this[key].on();
		}
		else {
			$('#page_options #'+key+'-button').trigger("click");
		}
	}
};

pageHandeler.prototype.setDefaults = function(){

	for(var i = 0; i < this.widgetKeys.length; i++) {
		this.data[this.widgetKeys[i]] = true;
	}
	this.loadWidgets();
};

function triggerWidget(event) {

	var that = event.data.that;
	var key = $(this).attr('id').split('-')[0];

	$(this).find('span').toggleClass('glyphicon-ok').toggleClass('glyphicon-remove');
	var id = "#" + key + "_col";
	$(id).toggle();
	resizeColumns();

	if($(this).find('span').hasClass('glyphicon-ok')) {
		that.data[key] = true;
		if(key in that) {
			that[key].on();	
		}
	}
	else {
		that.data[key] = false;
		if(key in that) {
			that[key].off();	
		}
	}
	that.saveData();
};

function resizeColumns() {

	this.$myCols = $('.row');
	var visibleCols = this.$myCols.children(":visible");

	if(visibleCols.length == 2 && 
		$(visibleCols[1]).attr('id') === 'Links_col') {

		this.$myCols.children().removeClass()
		$(visibleCols[0]).addClass('col-sm-9');
		$(visibleCols[1]).addClass('col-sm-3');

	}
	else if(visibleCols.length == 3) {

		$(visibleCols[0]).addClass('col-sm-5');
		$(visibleCols[1]).addClass('col-sm-5');
		$(visibleCols[2]).addClass('col-sm-2');
	}
	else {
		var div = Math.floor(12 / visibleCols.length);
		var rem = 12 % visibleCols.length;
		var colSize = (rem === 0) ? div : 2;
		this.$myCols.children().removeClass().addClass('col-sm-'+colSize);
	}
};
