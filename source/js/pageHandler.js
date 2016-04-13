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
	$("body").tooltip({ selector: '[data-toggle=tooltip]' });

	/*  example-- 
		'background': 'linear-gradient(to left, #525252, #3d72b4)'
		gradients from && inspired from http://uigradients.com/#	
	*/	
	/*var styles = [
		//'linear-gradient(to left, #525252, #3d72b4)',
		//'linear-gradient(to left, #0099F7 , #F11712)',
		//'linear-gradient(to left, #4776E6 , #8E54E9)',
		'linear-gradient(to left, #4B79A1 , #283E51)',  // dark skys
		//'linear-gradient(to left, #457fca , #5691c8)',
		'linear-gradient(to left, #457fca , #5691c8)',  // inbox -- fav
		//'linear-gradient(to left, #8E0E00 , #1F1C18)',	// netflix
		//'linear-gradient(to left, #76b852 , #8DC26F)',	// little leaf
		'linear-gradient(to left, #1e3c72 , #2a5298)',	// joomla -- nice, dark blue -- fav
		'linear-gradient(to left, #C04848 , #480048)',  // influenza - purple, pink
		'linear-gradient(to left, #4CA1AF , #C4E0E5)',  // decent - light blue
		'linear-gradient(to left, #136a8a , #267871)',  // turquoise flow -- fav
		'linear-gradient(to left, #360033 , #0b8793)',	// purple bliss -- fav
		'linear-gradient(to left, #00c6ff , #0072ff)', 	// facebook messenger
		'linear-gradient(to left, #fe8c00 , #f83600)', 	// soundcloud
		'linear-gradient(to left, #C02425 , #F0CB35)', 	// back to the future
		//'linear-gradient(to left, #00bf8f , #001510)',	// vine // green	
		//'linear-gradient(to left, #6441A5 , #2a0845)', 	// twitch
	];*/

	//var randomIndex = Math.floor(Math.random() * styles.length);

	/* 
		use animate to fade background in to take the sting out of the 
		white flash at the beginning ( can’t seem to get rid of it )
	*/ 
	/*$('body').animate({opacity: 0}, 0).css({
		//'background': styles[randomIndex]
		background: 'linear-gradient(to left, #136a8a , #267871)'
	}).animate({opacity: 1}, 400); //old -- 250 / 450 is kinda smooth, but slow*/

	/*$('#background_color').html(' >> Current background: ' + styles[randomIndex]);*/
    
	//$('body').animate({opacity: 0}, 0).css({'background-image': 'url(http://vaughnroyko.com/jsfiddle/back.png)'}).animate({opacity: 1}, 250);

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

	this.NFL = new NFL();
	this.NBA = new NBA();
	this.Links = new Links();

	this.widgetKeys = ['NFL', 'NBA', 'Links'];

	/* this.data.<stuff> is set in this.setDefaults */
};

pageHandeler.prototype = Object.create(Base.prototype); // See note below
pageHandeler.prototype.constructor = pageHandeler;

pageHandeler.prototype.init = function(){

	var that = this;
	$('#page_options button').on('click', {that: that}, triggerWidget);
	//$('body').on('click', $('#page_options button'), triggerWidget);
	$('#custom-message-btn').on('click', {that: that}, this.triggerMessage);
	//$('body').on('click', $('#custom-message-btn'), {self: that}, this.triggerMessage);

	this.loadData(this.loadFunctionality, this.setDefaults);
};

pageHandeler.prototype.loadFunctionality = function(){
	if(dev_env) {
		this.loadDev();
	}
	//this.loadMessage();
	this.loadWidgets();
};

pageHandeler.prototype.loadMessage = function(){

	if(this.data.version !== chrome.app.getDetails().version) {
		this.data.message = true;
		this.data.version = chrome.app.getDetails().version;
		this.saveData();
	}
	if(this.data.message) {
		$('#custom-message').show();
	}
};

pageHandeler.prototype.loadDev = function(){
	$('#_dev_btn').show();
	$('#_dev_btn').on('click', {self: this}, function(event) {
		var self = event.data.self;
		self.data.message = true;
		self.data = null;
		self.saveData();
		location.reload();
	});
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

	this.data.message = true;
	this.data.version = chrome.app.getDetails().version;
	this.loadFunctionality();
};

function triggerWidget(event) {

	var that = event.data.that;
	var key = $(this).attr('id').split('-')[0];

	$(this).find('span').toggleClass('glyphicon-ok').toggleClass('glyphicon-remove');
	var id = "#" + key + "_col";
	$(id).toggle();

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

pageHandeler.prototype.triggerMessage = function(event){
	var self = event.data.that;
	self.data.message = false;
	self.saveData();
};