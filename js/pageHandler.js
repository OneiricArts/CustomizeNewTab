var debug = false;
if(debug){console.log('myScript running ...');}

$( document ).ready(function() {
   var obj = new pageHandeler();
   obj.init();
});


function pageHandeler() {
	Base.call(this);
	this.datakey = 'pageHndler_widgets';
	this.$myCols;
};

pageHandeler.prototype = Object.create(Base.prototype); // See note below

pageHandeler.prototype.constructor = pageHandeler;

pageHandeler.prototype.init = function(){
	//console.log(this.data);
	this.loadData(this.datakey, this.loadWidgets, this.setDefaults);

	this.$myCols = $('.row');
	console.log('-----');
	console.log(this.$myCols)
	var that = this;
	$('#page_options button').on('click', {that: that}, triggerWidget);
	//$('body').on('click', $('#page_options button'), triggerWidget);
};


pageHandeler.prototype.loadWidgets = function(){
		
		console.log('loadWidgets');
		console.log(this.data);

		NBAschedule.handler();
		NFLschedule.handler();

		if(this.data['NFL']) {
		//NFLschedule.handler();
		}
		else {
			$('#page_options #NFL-button').trigger("click");
		}

		if(this.data['NBA']) {
		//NBAschedule.handler();
		}
		else {
		$('#page_options #NBA-button').trigger("click");
		}

		if(this.data['Links']) {
		}
		else {
			$('#page_options #Links-button').trigger("click");
		}
};

pageHandeler.prototype.setDefaults = function(){

	console.log('setDefaults');
	this.data['NBA'] = true;
	this.data['NFL'] = true;
	this.data['Links'] = true;

	this.loadWidgets();
};

function triggerWidget(event) {

	console.log(event.data);
	var that = event.data.that;

	$(this).find('span').toggleClass('glyphicon-ok').toggleClass('glyphicon-remove');
	var id = "#" + $(this).attr('id').split('-')[0] + "_col";
	$(id).toggle();
	resizeColumns();


	if($(this).find('span').hasClass('glyphicon-ok')) {
		that.data[$(this).attr('id').split('-')[0]] = true;
	}
	else {
		that.data[$(this).attr('id').split('-')[0]] = false;
	}
	that.saveData();
};

function resizeColumns() {
  //console.log('resizing. ..');
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
