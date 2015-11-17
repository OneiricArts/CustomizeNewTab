// Define the Person constructor
var Base = function() {
	this.data = {};
	this.datakey;
	//console.log(this)
};


Base.prototype.loadData = function (key, callbackSuccess, callbackFail) {

	chrome.storage.local.get(key, function(result) {

		if(result[key]) {
			this.data = result[key];
			console.log(this.data)
			callbackSuccess.call(this);
		}
		else{
			callbackFail.call(this);
		}
		//this.functionName();

	}.bind(this));
};

Base.prototype.saveData = function() {
	
	console.log(this.data);
	var obj = {};
	obj[this.datakey] = this.data;

	chrome.storage.local.set( obj, 
		function() {
			if(debug){console.log('Base Obj Settings saved');}
	});
};