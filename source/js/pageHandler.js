//var debug = false;
//if(debug){console.log('myScript running ...');}

/*
	detect if development environment by checking local extension id 
	to chrome store extension id

	features for development-only could be stuff ...
		- i personally like that others wouldnt
		- i am testing long-term before pushing to everyone
		- i am too lazy to implement the correct way, 
			but want to use the easy way for myself
	could also move this to a 'alpha' flag in options (not implemented yet)

*/
var this_extensionId = chrome.i18n.getMessage('@@extension_id');
var chrome_store_extension_id = 'cbdhcjkifbkbckpoejnakoekiheijpei';
var dev_env = this_extensionId !== chrome_store_extension_id;
//console.log(dev_env);

$( document ).ready(function() {
   var obj = new pageHandeler();
   obj.init();

	if (!navigator.onLine) {
		$('#no-internet-alert').show();
	}
});

window.addEventListener("offline", function(e) { 
	$('#no-internet-alert').fadeIn();
});

/*
	reload page when online so page can 'reset' correctly
	this is cleaner than trying to init objects again that had problems
*/
window.addEventListener("online", function(e) { 
	//$('#no-internet-alert').fadeOut();
	document.location.reload();
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

};
