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

Base.prototype.displayTemplate = function($template, dataKey, dataObj, $element) {

	var source = $template;
	var template = Handlebars.compile(source);
	var data = {};
	data[dataKey] = dataObj;
	var output = template(data);
	$element.html(output);
};