
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

		// Handlebars helper functions
		Handlebars.registerHelper('addOne', function(value) {
			return value + 1;
		});
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


	toLocalTime(hours, minutes, options) {
		if(!options) {
			options = {};
		}

		try {
			var hours = parseInt(hours);
			var minutes = parseInt(minutes);

			// convert to 24 hours if need to (and provide AM/PM)
			if(options.ampm === 'PM' && hours < 12) {
				hours += 12;
			} else if(options.ampm === 'AM' && hours == 12) { 
				hours = 0;
			}

			// EST + 5 = UTC
			var EST_UTC_OFFSET = 5;

			var date = new Date();
			date.setUTCHours((hours + EST_UTC_OFFSET) % 24, minutes, 0);

			if(!options.format) {
				options.format = {'hour': '2-digit', 'minute': '2-digit'};
			}
			return date.toLocaleTimeString([], options.format);
		}
		catch (e) {
			console.log(e);
			return null;
		}
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