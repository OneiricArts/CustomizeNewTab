// Define the Person constructor
var Base = function() {
	this.initialized = false;
	this.data = {};
	this.datakey;
	this.domElement;
	//console.log(this)
};


Base.prototype.on = function () {
	if(this.initialized == false) {
		this.initialized = true;
		this.init();
	}
};

Base.prototype.off = function () {
	//window timeout
	console.log('off');
};

Base.prototype.init = function () {}

Base.prototype.loadData = function (callbackSuccess, callbackFail) {

	chrome.storage.local.get(this.key, function(result) {

		if(result[this.datakey]) {
			this.data = result[this.datakey];
			//console.log(this.data)
			callbackSuccess.call(this);
		}
		else{
			callbackFail.call(this);
		}
		//this.functionName();
	}.bind(this));
};

Base.prototype.saveData = function(callback) {
	
	var obj = {};
	obj[this.datakey] = this.data;

	chrome.storage.local.set( obj, function() {
		if(callback){callback.call(this);}
	}.bind(this));
};

/*
	@$template  -- the source template. needs HTML code, not ID or dom element
	@dataKey    -- what the top level data structure in the template will be referenced with
	@dataObj    -- the top level data structure being passed to template
	@$element   -- dom element, not id, its html will be replaced with template
	@showAffect -- fade in affect, optional
*/
Base.prototype.displayTemplate = function($template, dataKey, dataObj, $element, showAffect) {
	var template = Handlebars.compile($template);
	var data = {};
	data[dataKey] = dataObj;
	var output = template(data);
	
	if(showAffect) {
		$element.hide();
		$element.html(output);
		$element.fadeIn(500);
	} else {
		$element.html(output);
	}
};

Base.prototype.getData = function(url, callback) {
	$.getJSON(url, function(result) {
		callback.call(this, result);
	}.bind(this));
	// TODO handle timeout, and network error
};