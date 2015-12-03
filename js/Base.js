// Define the Person constructor
var Base = function() {
	this.initialized = false;
	this.data = {};
	this.datakey;
	this.domElement;
	//console.log(this)
};

Base.prototype.init = function () {
	this.initialized = true;
}

Base.prototype.trigger = function (showOrHide) {
	if(showOrHide) {
		this.domElement.trigger(showOrHide);
	}
	else {
		this.domElement.trigger();
	}
};

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