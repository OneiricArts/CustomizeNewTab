// Define the Person constructor
var Base = function() {
	this.data = {};
	this.datakey;
	this.domElement;
	//console.log(this)
};


Base.prototype.trigger = function (showOrHide) {
	if(showOrHide) {
		this.domElement.trigger(showOrHide);
	}
	else {
		this.domElement.trigger();
	}
};

Base.prototype.loadData = function (key, callbackSuccess, callbackFail) {

	chrome.storage.local.get(key, function(result) {

		if(result[key]) {
			this.data = result[key];
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
	
	//console.log(this.data);
	var obj = {};
	obj[this.datakey] = this.data;

	chrome.storage.local.set( obj, function() {
		if(callback){callback.call(this);}
	}.bind(this));
};