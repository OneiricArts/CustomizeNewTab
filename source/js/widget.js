
"use strict";

/*
	Widget class
		- needs jQuery
		- handlebars runtime
*/
class Widget {

	constructor() {
		this.initialized = false;
		this.data = {};
		this.dataKey;
		this.domElement;
	}

	on() {
		if(this.initialized == false) {
			this.initialized = true;
			this.init();
		}
	}

	/*
	 * 	each widget is responsible for overriding   
	 */
	
	off() {}  // called when user has turned off widget, handle clearouts, etc.
	init() {} // called from on(). handle initializing the widget
	

	/**
	* ============================================================================
	*  			complete functions / standard widget functionality   
	* ============================================================================
	*/

	/*
		@$template  -- name of .handlebars file
		@dataKey    -- name of top level data structure passed to template
		@dataObj    -- top level data structure being passed to template
		@$element   -- dom element, not id, its html will be replaced with template
		@showAffect -- [optional] fade in affect
	*/
	displayTemplate(tempalte_name, dataKey, dataObj, $element, showAffect) {
	
		var template = Handlebars.templates[tempalte_name];

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
	}

	getData(url, callback) {
		$.getJSON(url, function(result) {
			callback.call(this, result);
		}.bind(this));
		// TODO handle timeout, and network error
	}

	/**
	* ============================================================================
	*  			Chrome specific widget functionality   
	* ============================================================================
	*/

	loadData(callbackSuccess, callbackFail) {

		chrome.storage.local.get(this.dataKey, function(result) {

			if(result[this.dataKey]) {
				this.data = result[this.dataKey];
				callbackSuccess.call(this);
			}
			else{
				callbackFail.call(this);
			}
		}.bind(this));
	}

	saveData(callback) {

		var obj = {};
		obj[this.dataKey] = this.data;

		chrome.storage.local.set( obj, function() {
			if(callback){callback.call(this);}
		}.bind(this));
	}
}